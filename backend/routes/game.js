const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();
const activityTables = { job: 'jobs', gym: 'gym', school: 'school', hospital: 'hospital' };
const formatSeconds = (amount, format) => Number(amount) * (format === 'Hours' ? 3600 : 60);
const now = () => Math.floor(Date.now() / 1000);

function fail(res, status, message) { return res.status(status).json({ message }); }

async function playerSnapshot(connection, playerId) {
  const [[player]] = await connection.execute(
    'SELECT id, username, avatar, role, level, money, gold, respect, health, energy, power, agility, endurance, intelligence, character_id AS characterId, bank, spins, theme, language FROM players WHERE id = ?',
    [playerId],
  );
  return player;
}

router.get('/dashboard', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('UPDATE players SET timeonline = ? WHERE id = ?', [String(now()), req.player.id]);
    let player = await playerSnapshot(connection, req.player.id);
    let levelsGained = 0;
    while (true) {
      const [[nextLevel]] = await connection.execute('SELECT level, min_respect FROM levels WHERE level > ? ORDER BY level LIMIT 1', [player.level]);
      if (!nextLevel || Number(player.respect) < Number(nextLevel.min_respect)) break;
      await connection.execute('UPDATE players SET level = ?, energy = 100, money = money + 1000, gold = gold + 2 WHERE id = ?', [nextLevel.level, req.player.id]);
      levelsGained += 1;
      player = { ...player, level: nextLevel.level, energy: 100, money: Number(player.money) + 1000, gold: Number(player.gold) + 2 };
    }
    const [[action]] = await connection.execute('SELECT type, finishtime FROM player_actions WHERE player_id = ? LIMIT 1', [req.player.id]);
    const [[level]] = await connection.execute('SELECT MIN(min_respect) AS next_respect FROM levels WHERE level = ?', [player.level + 1]);
    const [[counts]] = await connection.query("SELECT (SELECT COUNT(*) FROM players) AS total_players, (SELECT COUNT(*) FROM players WHERE CAST(timeonline AS UNSIGNED) > UNIX_TIMESTAMP() - 300) AS online_players");
    const [properties] = await connection.execute(
      'SELECT pp.property_id AS id, p.property, p.income, p.format, p.time, pp.profittime FROM player_properties pp JOIN properties p ON p.id = pp.property_id WHERE pp.player_id = ? ORDER BY pp.id',
      [req.player.id],
    );
    await connection.commit();
    res.json({ player, levelsGained, activeAction: action ? { type: action.type, finishAt: Number(action.finishtime), secondsLeft: Math.max(0, Number(action.finishtime) - now()) } : null, nextLevelRespect: level?.next_respect ?? null, ...counts, properties });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
});

router.get('/activities', async (_req, res) => {
  const [jobs] = await pool.query('SELECT id, job_type AS name, energy_cost AS energyCost, health_loss AS healthLoss, format, time, money, gold FROM jobs ORDER BY money');
  const [gym] = await pool.query('SELECT id, workout_type AS name, power, agility, endurance, energy_cost AS energyCost, health_restore AS healthRestore, fee, time, format FROM gym ORDER BY id');
  const [school] = await pool.query('SELECT id, subject AS name, energy_cost AS energyCost, intelligence, fee, time, format FROM school ORDER BY id');
  const [hospital] = await pool.query('SELECT id, treatment_type AS name, cost, time, format, health_restore AS healthRestore FROM hospital ORDER BY id');
  res.json({ jobs, gym, school, hospital });
});

const catalogQueries = {
  vehicles: `SELECT v.id, v.image, v.speed, v.acceleration, v.stability, v.money, v.gold, v.min_level AS minLevel, v.respect, v.vip, c.category, EXISTS(SELECT 1 FROM player_vehicles pv WHERE pv.vehicle_id=v.id AND pv.player_id=?) AS owned FROM vehicles v LEFT JOIN vehicle_categories c ON c.id = v.category_id WHERE v.active = 'Yes' ORDER BY v.money`,
  properties: 'SELECT p.id, p.property AS name, p.image, p.money, p.gold, p.min_level AS minLevel, p.respect, p.income, p.format, p.time, pp.profittime, (pp.id IS NOT NULL) AS owned FROM properties p LEFT JOIN player_properties pp ON pp.property_id=p.id AND pp.player_id=? ORDER BY p.min_level',
  pets: 'SELECT p.id, p.name, p.image, p.money, p.gold, p.respect, p.min_level AS minLevel, p.bonustype AS bonusType, p.bonusvalue AS bonusValue, p.vip, EXISTS(SELECT 1 FROM player_pets pp WHERE pp.pet_id=p.id AND pp.player_id=?) AS owned FROM pets p ORDER BY p.min_level',
  shop: 'SELECT i.id, i.item AS name, i.image, i.bonustype AS bonusType, i.bonusvalue AS bonusValue, i.money, i.gold, i.respect, i.min_level AS minLevel, i.vip, c.category, EXISTS(SELECT 1 FROM player_items pi WHERE pi.item_id=i.id AND pi.player_id=?) AS owned FROM items i LEFT JOIN item_categories c ON c.id = i.category_id ORDER BY i.money',
  resources: 'SELECT id, service AS name, image, type, amount, cost, currency FROM paid_services ORDER BY cost',
  leaderboard: 'SELECT id, username, avatar, level, respect, power, agility, endurance, intelligence FROM players ORDER BY level DESC, respect DESC LIMIT 100',
  casino: 'SELECT id, prizetype AS prizeType, value, color FROM casino_prizes ORDER BY id',
  races: 'SELECT id, username, avatar, level, respect FROM players WHERE id <> ? ORDER BY level DESC, respect DESC LIMIT 50',
  fights: 'SELECT id, username, avatar, level, respect, power, agility, endurance FROM players WHERE id <> ? ORDER BY level DESC, power DESC LIMIT 50',
  'home-upgrades': 'SELECT h.id, CONCAT("Home ",h.id) AS name, h.image, h.money, h.gold, h.min_level AS minLevel, h.respect, h.max_pets AS capacity, (p.home_id=h.id) AS owned FROM homes h CROSS JOIN players p WHERE p.id=? ORDER BY h.id',
  'garage-upgrades': 'SELECT g.id, CONCAT("Garage ",g.id) AS name, g.image, g.money, g.gold, g.min_level AS minLevel, g.respect, g.max_vehicles AS capacity, (p.garage_id=g.id) AS owned FROM garages g CROSS JOIN players p WHERE p.id=? ORDER BY g.id',
  'hangar-upgrades': 'SELECT h.id, CONCAT("Hangar ",h.id) AS name, h.image, h.money, h.gold, h.min_level AS minLevel, h.respect, h.max_vehicles AS capacity, (p.hangar_id=h.id) AS owned FROM hangars h CROSS JOIN players p WHERE p.id=? ORDER BY h.id',
  'quay-upgrades': 'SELECT q.id, CONCAT("Quay ",q.id) AS name, q.image, q.money, q.gold, q.min_level AS minLevel, q.respect, q.max_vehicles AS capacity, (p.quay_id=q.id) AS owned FROM quays q CROSS JOIN players p WHERE p.id=? ORDER BY q.id',
};

router.get('/catalog/:kind', async (req, res) => {
  const query = catalogQueries[req.params.kind];
  if (!query) return fail(res, 404, 'This catalog is not available.');
  const [rows] = ['vehicles', 'properties', 'pets', 'shop', 'races', 'fights', 'home-upgrades', 'garage-upgrades', 'hangar-upgrades', 'quay-upgrades'].includes(req.params.kind)
    ? await pool.execute(query, [req.player.id])
    : await pool.query(query);
  res.json({ items: rows });
});

router.get('/characters', async (_req, res) => {
  const [categories] = await pool.query('SELECT id, category AS name, fa_icon AS icon FROM character_categories ORDER BY id');
  const [characters] = await pool.query('SELECT id, name, image, category_id AS categoryId, power, agility, endurance, intelligence FROM characters ORDER BY category_id, id');
  res.json({ categories, characters });
});

router.post('/character', async (req, res) => {
  const id = Number(req.body.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a character first.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT character_id FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    if (Number(player.character_id) !== 0) { await connection.rollback(); return fail(res, 409, 'Your character has already been selected.'); }
    const [[character]] = await connection.execute('SELECT * FROM characters WHERE id=?', [id]);
    if (!character) { await connection.rollback(); return fail(res, 404, 'Character not found.'); }
    const bonus = ['power', 'agility', 'endurance', 'intelligence'].map((stat) => character[stat] === 'Yes' ? 10 : 0);
    await connection.execute('UPDATE players SET character_id=?, power=LEAST(250,power+?), agility=LEAST(250,agility+?), endurance=LEAST(250,endurance+?), intelligence=LEAST(250,intelligence+?) WHERE id=?', [id, ...bonus, req.player.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, message: `${character.name} selected.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

const upgradeTypes = {
  home: { table: 'homes', column: 'home_id' },
  garage: { table: 'garages', column: 'garage_id' },
  hangar: { table: 'hangars', column: 'hangar_id' },
  quay: { table: 'quays', column: 'quay_id' },
};
const statColumns = { power: 'power', agility: 'agility', endurance: 'endurance', intelligence: 'intelligence' };

router.post('/purchases/:kind/:id', async (req, res) => {
  const { kind } = req.params;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid listing.');
  const config = { property: { table: 'properties' }, pet: { table: 'pets' }, item: { table: 'items' }, vehicle: { table: 'vehicles' }, ...upgradeTypes }[kind];
  if (!config) return fail(res, 404, 'This purchase is not available.');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT * FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    const [[listing]] = await connection.execute(`SELECT * FROM ${config.table} WHERE id=? LIMIT 1`, [id]);
    if (!listing) { await connection.rollback(); return fail(res, 404, 'Listing not found.'); }
    if (listing.vip === 'Yes' && player.role !== 'VIP') { await connection.rollback(); return fail(res, 403, 'This listing requires VIP status.'); }
    if (Number(player.level) < Number(listing.min_level || 1)) { await connection.rollback(); return fail(res, 400, `You need level ${listing.min_level} to get this.`); }
    const money = Number(listing.money || 0);
    const gold = Number(listing.gold || 0);
    if (Number(player.money) < money || Number(player.gold) < gold) { await connection.rollback(); return fail(res, 400, 'You do not have enough money or gold.'); }

    if (['home', 'garage', 'hangar', 'quay'].includes(kind)) {
      if (Number(player[config.column]) === id) { await connection.rollback(); return fail(res, 409, 'You already own this upgrade.'); }
      await connection.execute(`UPDATE players SET money=money-?, gold=gold-?, respect=respect+?, ${config.column}=? WHERE id=?`, [money, gold, listing.respect || 0, id, req.player.id]);
    } else if (kind === 'property') {
      const [[owned]] = await connection.execute('SELECT id FROM player_properties WHERE player_id=? AND property_id=?', [req.player.id, id]);
      if (owned) { await connection.rollback(); return fail(res, 409, 'You already own this property.'); }
      const seconds = Number(listing.time) * (listing.format === 'Hours' ? 3600 : 60);
      await connection.execute('UPDATE players SET money=money-?, gold=gold-?, respect=respect+? WHERE id=?', [money, gold, listing.respect, req.player.id]);
      await connection.execute('INSERT INTO player_properties (player_id,property_id,profittime) VALUES (?,?,?)', [req.player.id, id, String(now() + seconds)]);
    } else if (kind === 'pet') {
      const [[home]] = await connection.execute('SELECT max_pets FROM homes WHERE id=?', [player.home_id]);
      const [[count]] = await connection.execute('SELECT COUNT(*) AS total FROM player_pets WHERE player_id=?', [req.player.id]);
      const [[owned]] = await connection.execute('SELECT id FROM player_pets WHERE player_id=? AND pet_id=?', [req.player.id, id]);
      if (owned) { await connection.rollback(); return fail(res, 409, 'You already adopted this pet.'); }
      if (!home || Number(count.total) >= Number(home.max_pets)) { await connection.rollback(); return fail(res, 400, 'Upgrade your home to make room for a pet.'); }
      const stat = statColumns[listing.bonustype];
      if (stat) await connection.execute(`UPDATE players SET money=money-?,gold=gold-?,respect=respect+?,${stat}=${stat}+? WHERE id=?`, [money,gold,listing.respect,listing.bonusvalue,req.player.id]);
      else await connection.execute('UPDATE players SET money=money-?,gold=gold-?,respect=respect+? WHERE id=?', [money,gold,listing.respect,req.player.id]);
      await connection.execute('INSERT INTO player_pets (player_id,pet_id) VALUES (?,?)', [req.player.id, id]);
    } else if (kind === 'item') {
      const singleUse = ['energy', 'health'].includes(listing.bonustype);
      const [[owned]] = await connection.execute('SELECT id FROM player_items WHERE player_id=? AND item_id=?', [req.player.id, id]);
      if (!singleUse && owned) { await connection.rollback(); return fail(res, 409, 'You already own this item.'); }
      const stat = statColumns[listing.bonustype];
      if (singleUse && listing.bonustype === 'energy' && Number(player.energy) >= 100) { await connection.rollback(); return fail(res, 400, 'Your energy is already full.'); }
      if (singleUse && listing.bonustype === 'health' && Number(player.health) >= 100) { await connection.rollback(); return fail(res, 400, 'Your health is already full.'); }
      const statSql = stat ? `${stat}=LEAST(250,${stat}+?)` : listing.bonustype === 'energy' ? 'energy=LEAST(100,energy+?)' : listing.bonustype === 'health' ? 'health=LEAST(100,health+?)' : '';
      if (!statSql) { await connection.rollback(); return fail(res, 400, 'This item effect is not supported.'); }
      await connection.execute(`UPDATE players SET money=money-?,gold=gold-?,respect=respect+?,${statSql} WHERE id=?`, [money,gold,listing.respect,listing.bonusvalue,req.player.id]);
      if (!singleUse) await connection.execute('INSERT INTO player_items (player_id,item_id) VALUES (?,?)', [req.player.id, id]);
    } else if (kind === 'vehicle') {
      const [[owned]] = await connection.execute('SELECT id FROM player_vehicles WHERE player_id=? AND vehicle_id=?', [req.player.id, id]);
      if (owned) { await connection.rollback(); return fail(res, 409, 'You already own this vehicle.'); }
      const category = Number(listing.category_id);
      const store = category === 4 ? { id: player.hangar_id, table: 'hangars' } : category === 5 ? { id: player.quay_id, table: 'quays' } : { id: player.garage_id, table: 'garages' };
      const [[capacity]] = store.id ? await connection.execute(`SELECT max_vehicles FROM ${store.table} WHERE id=?`, [store.id]) : [[null]];
      if (!capacity) { await connection.rollback(); return fail(res, 400, `Buy a ${category === 4 ? 'hangar' : category === 5 ? 'quay' : 'garage'} before buying this vehicle.`); }
      const categoryCheck = category === 4 ? 'v.category_id=4' : category === 5 ? 'v.category_id=5' : 'v.category_id NOT IN (4,5)';
      const [[ownedCount]] = await connection.execute(`SELECT COUNT(*) AS total FROM player_vehicles pv JOIN vehicles v ON v.id=pv.vehicle_id WHERE pv.player_id=? AND ${categoryCheck}`, [req.player.id]);
      if (Number(ownedCount.total) >= Number(capacity.max_vehicles)) { await connection.rollback(); return fail(res, 400, 'There is no free space for this vehicle.'); }
      await connection.execute('UPDATE players SET money=money-?,gold=gold-?,respect=respect+? WHERE id=?', [money,gold,listing.respect,req.player.id]);
      await connection.execute('INSERT INTO player_vehicles (player_id,vehicle_id,speed,acceleration,stability) VALUES (?,?,?,?,?)', [req.player.id,id,listing.speed,listing.acceleration,listing.stability]);
    }
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.status(201).json({ player: snapshot, message: `${listing.name || listing.property || listing.item || kind} added to your city life.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/sales/:kind/:id', async (req, res) => {
  const { kind } = req.params;
  const id = Number(req.params.id);
  if (!['item', 'pet', 'vehicle'].includes(kind) || !Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid item to sell.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('SELECT id FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    const table = kind === 'item' ? 'items' : kind === 'pet' ? 'pets' : 'vehicles';
    const ownedTable = kind === 'item' ? 'player_items' : kind === 'pet' ? 'player_pets' : 'player_vehicles';
    const ownedColumn = kind === 'vehicle' ? 'vehicle_id' : kind === 'pet' ? 'pet_id' : 'item_id';
    const effectColumns = kind === 'vehicle' ? '' : ', d.bonustype AS bonusType, d.bonusvalue AS bonusValue';
    const [[owned]] = await connection.execute(`SELECT o.id, d.money, d.gold${effectColumns} FROM ${ownedTable} o JOIN ${table} d ON d.id=o.${ownedColumn} WHERE o.player_id=? AND o.${ownedColumn}=? LIMIT 1 FOR UPDATE`, [req.player.id,id]);
    if (!owned) { await connection.rollback(); return fail(res, 404, `You do not own this ${kind}.`); }
    await connection.execute(`DELETE FROM ${ownedTable} WHERE id=?`, [owned.id]);
    const stat = kind === 'vehicle' ? null : statColumns[owned.bonusType];
    if (stat) await connection.execute(`UPDATE players SET money=money+?,gold=gold+?,${stat}=GREATEST(0,${stat}-?) WHERE id=?`, [Math.floor(owned.money/2),Math.floor(owned.gold/2),owned.bonusValue,req.player.id]);
    else await connection.execute('UPDATE players SET money=money+?,gold=gold+? WHERE id=?', [Math.floor(owned.money/2),Math.floor(owned.gold/2),req.player.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, message: `${kind[0].toUpperCase()}${kind.slice(1)} sold for a partial refund.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/properties/:id/collect', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid property.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[owned]] = await connection.execute('SELECT pp.id,pp.profittime,p.income,p.time,p.format FROM player_properties pp JOIN properties p ON p.id=pp.property_id WHERE pp.player_id=? AND pp.property_id=? FOR UPDATE', [req.player.id,id]);
    if (!owned) { await connection.rollback(); return fail(res, 404, 'You do not own this property.'); }
    if (Number(owned.profittime) > now()) { await connection.rollback(); return fail(res, 400, 'Property income is not ready yet.'); }
    const nextAt = now() + Number(owned.time) * (owned.format === 'Hours' ? 3600 : 60);
    await connection.execute('UPDATE players SET money=money+? WHERE id=?', [owned.income,req.player.id]);
    await connection.execute('UPDATE player_properties SET profittime=? WHERE id=?', [String(nextAt),owned.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, income: owned.income, nextAt, message: `Collected $${owned.income} property income.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.get('/vehicles/owned', async (req, res) => {
  const [vehicles] = await pool.execute('SELECT pv.vehicle_id AS id, pv.speed, pv.acceleration, pv.stability, v.image, v.category_id AS categoryId, c.category FROM player_vehicles pv JOIN vehicles v ON v.id=pv.vehicle_id LEFT JOIN vehicle_categories c ON c.id=v.category_id WHERE pv.player_id=? ORDER BY pv.id', [req.player.id]);
  res.json({ vehicles });
});

router.post('/vehicles/:id/upgrade', async (req, res) => {
  const id = Number(req.params.id);
  const stat = req.body.stat;
  if (!Number.isInteger(id) || id < 1 || !['speed', 'acceleration', 'stability'].includes(stat)) return fail(res, 400, 'Choose a valid vehicle stat.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT money FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    const [[vehicle]] = await connection.execute('SELECT * FROM player_vehicles WHERE player_id=? AND vehicle_id=? FOR UPDATE', [req.player.id,id]);
    if (!vehicle) { await connection.rollback(); return fail(res, 404, 'You do not own this vehicle.'); }
    const current = Number(vehicle[stat]);
    const cost = current * 8;
    if (current + 1 > 500) { await connection.rollback(); return fail(res, 400, 'This vehicle stat is already at its limit.'); }
    if (Number(player.money) < cost) { await connection.rollback(); return fail(res, 400, `You need $${cost} for this upgrade.`); }
    await connection.execute(`UPDATE player_vehicles SET ${stat}=${stat}+1 WHERE id=?`, [vehicle.id]);
    await connection.execute('UPDATE players SET money=money-?, respect=respect+50 WHERE id=?', [cost,req.player.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, cost, message: `${stat} upgraded for $${cost}.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.get('/messages', async (req, res) => {
  const [messages] = await pool.execute(
    'SELECT m.id,m.fromid AS fromId,m.toid AS toId,m.content,m.date,m.time,m.viewed, sender.username AS sender, recipient.username AS recipient FROM messages m JOIN players sender ON sender.id=m.fromid JOIN players recipient ON recipient.id=m.toid WHERE m.fromid=? OR m.toid=? ORDER BY m.id DESC LIMIT 100',
    [req.player.id,req.player.id],
  );
  res.json({ messages });
});

router.post('/messages', async (req, res) => {
  const recipient = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  if (!recipient || !content || content.length > 1000) return fail(res, 400, 'Enter a recipient and a message up to 1,000 characters.');
  const [[target]] = await pool.execute('SELECT id FROM players WHERE username=? LIMIT 1', [recipient]);
  if (!target) return fail(res, 404, 'Player not found.');
  const date = new Date();
  const [result] = await pool.execute('INSERT INTO messages (fromid,toid,date,time,content,viewed) VALUES (?,?,?,?,?,?)', [req.player.id,target.id,date.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}),date.toTimeString().slice(0,5),content,'No']);
  res.status(201).json({ id: result.insertId, message: 'Message sent.' });
});

router.post('/messages/:id/read', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid message.');
  await pool.execute("UPDATE messages SET viewed='Yes' WHERE id=? AND toid=?", [id,req.player.id]);
  res.json({ message: 'Message marked as read.' });
});

router.get('/players/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid player.');
  const [[player]] = await pool.execute('SELECT id,username,avatar,role,level,money,gold,respect,health,energy,power,agility,endurance,intelligence,timeonline FROM players WHERE id=?', [id]);
  if (!player) return fail(res, 404, 'Player not found.');
  const [comments] = await pool.execute('SELECT c.id,c.author_id AS authorId,a.username AS author,c.comment,c.date,c.time FROM player_comments c JOIN players a ON a.id=c.author_id WHERE c.player_id=? ORDER BY c.id DESC LIMIT 50', [id]);
  res.json({ player, comments });
});

router.post('/players/:id/comments', async (req, res) => {
  const id = Number(req.params.id);
  const content = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
  if (!Number.isInteger(id) || id < 1 || !content || content.length > 255) return fail(res, 400, 'Write a comment up to 255 characters.');
  const [[target]] = await pool.execute('SELECT id FROM players WHERE id=?', [id]);
  if (!target) return fail(res, 404, 'Player not found.');
  const date = new Date();
  const [result] = await pool.execute('INSERT INTO player_comments (player_id,author_id,comment,date,time) VALUES (?,?,?,?,?)', [id,req.player.id,content,date.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}),date.toTimeString().slice(0,5)]);
  res.status(201).json({ id: result.insertId, message: 'Comment posted.' });
});

router.put('/settings', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const avatar = typeof req.body.avatar === 'string' ? req.body.avatar.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(res, 400, 'Enter a valid email address.');
  if (avatar.length > 255) return fail(res, 400, 'Avatar path must be 255 characters or fewer.');
  if (password && (password.length < 8 || password.length > 72)) return fail(res, 400, 'Password must be between 8 and 72 characters.');
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  try {
    await pool.execute(passwordHash
      ? 'UPDATE players SET email=?,avatar=?,password=? WHERE id=?'
      : 'UPDATE players SET email=?,avatar=? WHERE id=?',
    passwordHash ? [email,avatar,passwordHash,req.player.id] : [email,avatar,req.player.id]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'That email address is already in use.');
    throw error;
  }
  res.json({ message: 'Account settings saved.' });
});

router.get('/preferences', async (req, res) => {
  const [languages] = await pool.query('SELECT langcode AS code, language AS name FROM languages ORDER BY id');
  const [themes] = await pool.query('SELECT id, name FROM themes ORDER BY id');
  res.json({ player: { email: req.player.email, avatar: req.player.avatar, language: req.player.language, theme: req.player.theme }, languages, themes });
});

router.put('/preferences', async (req, res) => {
  const language = typeof req.body.language === 'string' ? req.body.language : '';
  const theme = Number(req.body.theme);
  const [[languageRow]] = await pool.execute('SELECT langcode FROM languages WHERE langcode=?', [language]);
  const [[themeRow]] = Number.isInteger(theme) ? await pool.execute('SELECT id FROM themes WHERE id=?', [theme]) : [[null]];
  if (!languageRow || !themeRow) return fail(res, 400, 'Choose a supported language and theme.');
  await pool.execute('UPDATE players SET language=?,theme=? WHERE id=?', [language,theme,req.player.id]);
  res.json({ message: 'Language and theme saved.' });
});

router.post('/casino/spin', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT spins FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    if (Number(player.spins) < 1) { await connection.rollback(); return fail(res, 400, 'You do not have any spins left.'); }
    const [[prize]] = await connection.query('SELECT * FROM casino_prizes ORDER BY RAND() LIMIT 1');
    if (!prize) { await connection.rollback(); return fail(res, 503, 'Casino prizes are not configured.'); }
    const value = Number(prize.value);
    const effect = ({ Money: 'money', Gold: 'gold', Respect: 'respect', Energy: 'energy', Health: 'health' })[prize.prizetype];
    if (!effect) { await connection.rollback(); return fail(res, 409, 'This prize type is not supported.'); }
    const bounds = ['energy','health'].includes(effect) ? 100 : null;
    await connection.execute(`UPDATE players SET spins=spins-1,${effect}=${bounds ? `LEAST(${bounds},${effect}+?)` : `${effect}+?`} WHERE id=?`, [value,req.player.id]);
    await connection.commit();
    res.json({ prize: { type: prize.prizetype, value, color: prize.color }, message: `You won ${value} ${prize.prizetype.toLowerCase()}!` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/casino/spins', async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return fail(res, 400, 'Choose between 1 and 10 spins.');
  const cost = quantity * 850;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT money FROM players WHERE id=? FOR UPDATE', [req.player.id]);
    if (Number(player.money) < cost) { await connection.rollback(); return fail(res, 400, 'You do not have enough money.'); }
    await connection.execute('UPDATE players SET money=money-?,spins=spins+? WHERE id=?', [cost,quantity,req.player.id]);
    await connection.commit();
    res.json({ message: `${quantity} spins purchased for $${cost}.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/bank/:operation', async (req, res) => {
  const operation = req.params.operation;
  const amount = Number(req.body.amount);
  if (!['deposit', 'withdraw'].includes(operation)) return fail(res, 404, 'Unknown bank operation.');
  if (!Number.isSafeInteger(amount) || amount <= 0) return fail(res, 400, 'Enter a positive whole number.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT money, bank FROM players WHERE id = ? FOR UPDATE', [req.player.id]);
    if (operation === 'deposit' && player.money < amount) { await connection.rollback(); return fail(res, 400, 'You do not have enough cash.'); }
    if (operation === 'withdraw' && player.bank < amount) { await connection.rollback(); return fail(res, 400, 'Your bank balance is too low.'); }
    const shift = operation === 'deposit' ? [-amount, amount] : [amount, -amount];
    await connection.execute('UPDATE players SET money = money + ?, bank = bank + ? WHERE id = ?', [...shift, req.player.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, message: operation === 'deposit' ? 'Cash deposited.' : 'Cash withdrawn.' });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/actions/:kind/start', async (req, res) => {
  const { kind } = req.params;
  const table = activityTables[kind];
  const id = Number(req.body.id);
  if (!table) return fail(res, 404, 'Unknown activity.');
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'Choose a valid activity.');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[player]] = await connection.execute('SELECT * FROM players WHERE id = ? FOR UPDATE', [req.player.id]);
    const [[active]] = await connection.execute('SELECT type FROM player_actions WHERE player_id = ? LIMIT 1', [req.player.id]);
    if (active) { await connection.rollback(); return fail(res, 409, `Finish or leave your current activity (${active.type}) first.`); }
    const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
    const item = rows[0];
    if (!item) { await connection.rollback(); return fail(res, 404, 'Activity was not found.'); }
    const energy = Number(item.energy_cost || 0);
    const fee = Number(item.fee ?? item.cost ?? 0);
    const healthLoss = Number(item.health_loss || 0);
    if (player.energy < energy) { await connection.rollback(); return fail(res, 400, 'You need more energy.'); }
    if (player.health < healthLoss) { await connection.rollback(); return fail(res, 400, 'Your health is too low.'); }
    if (player.money < fee) { await connection.rollback(); return fail(res, 400, 'You do not have enough cash.'); }
    if (kind === 'hospital' && player.health >= 100) { await connection.rollback(); return fail(res, 400, 'Your health is already full.'); }
    const title = item.job_type || item.workout_type || item.subject || item.treatment_type;
    const finishAt = now() + formatSeconds(item.time, item.format);
    await connection.execute('INSERT INTO player_actions (player_id, type, finishtime) VALUES (?, ?, ?)', [req.player.id, title, String(finishAt)]);
    await connection.execute('UPDATE players SET energy = energy - ?, health = health - ?, money = money - ? WHERE id = ?', [energy, healthLoss, fee, req.player.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.status(201).json({ player: snapshot, activeAction: { type: title, finishAt, secondsLeft: finishAt - now() }, message: `${title} started.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/actions/finish', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[active]] = await connection.execute('SELECT id, type, finishtime FROM player_actions WHERE player_id = ? LIMIT 1 FOR UPDATE', [req.player.id]);
    if (!active) { await connection.rollback(); return fail(res, 404, 'You have no active activity.'); }
    if (Number(active.finishtime) > now()) { await connection.rollback(); return fail(res, 400, 'This activity is not finished yet.'); }
    let sql = null; let values = [];
    for (const [kind, table] of Object.entries(activityTables)) {
      const [activities] = await connection.execute(`SELECT * FROM ${table} WHERE ${kind === 'job' ? 'job_type' : kind === 'gym' ? 'workout_type' : kind === 'school' ? 'subject' : 'treatment_type'} = ? LIMIT 1`, [active.type]);
      const item = activities[0];
      if (!item) continue;
      if (kind === 'job') { sql = 'UPDATE players SET money = money + ?, gold = gold + ? WHERE id = ?'; values = [item.money, item.gold, req.player.id]; }
      if (kind === 'gym') { sql = 'UPDATE players SET power = LEAST(250, power + ?), agility = LEAST(250, agility + ?), endurance = LEAST(250, endurance + ?), health = LEAST(100, health + ?) WHERE id = ?'; values = [item.power, item.agility, item.endurance, item.health_restore, req.player.id]; }
      if (kind === 'school') { sql = 'UPDATE players SET intelligence = LEAST(250, intelligence + ?) WHERE id = ?'; values = [item.intelligence, req.player.id]; }
      if (kind === 'hospital') { sql = 'UPDATE players SET health = LEAST(100, health + ?) WHERE id = ?'; values = [item.health_restore, req.player.id]; }
      break;
    }
    if (!sql) { await connection.rollback(); return fail(res, 409, 'This activity no longer exists.'); }
    await connection.execute(sql, values);
    await connection.execute('DELETE FROM player_actions WHERE id = ?', [active.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, message: `${active.type} completed.` });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

router.post('/actions/leave', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[active]] = await connection.execute('SELECT id, type, finishtime FROM player_actions WHERE player_id = ? LIMIT 1 FOR UPDATE', [req.player.id]);
    if (!active) { await connection.rollback(); return fail(res, 404, 'You have no active activity.'); }
    if (Number(active.finishtime) <= now()) { await connection.rollback(); return fail(res, 400, 'This activity is ready to finish. Collect the reward instead.'); }
    let refund = { money: 0, energy: 0, health: 0 };
    for (const [kind, table] of Object.entries(activityTables)) {
      const nameColumn = kind === 'job' ? 'job_type' : kind === 'gym' ? 'workout_type' : kind === 'school' ? 'subject' : 'treatment_type';
      const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE ${nameColumn} = ? LIMIT 1`, [active.type]);
      if (!rows[0]) continue;
      const item = rows[0];
      if (kind === 'job') refund = { money: 0, energy: Math.floor(item.energy_cost / 2), health: Math.floor(item.health_loss / 2) };
      if (kind === 'gym') refund = { money: Math.floor(item.fee / 2), energy: Math.floor(item.energy_cost / 2), health: 0 };
      if (kind === 'school') refund = { money: Math.floor(item.fee / 2), energy: Math.floor(item.energy_cost / 2), health: 0 };
      if (kind === 'hospital') refund = { money: Math.floor(item.cost / 2), energy: 0, health: 0 };
      await connection.execute('UPDATE players SET money = money + ?, energy = LEAST(100, energy + ?), health = LEAST(100, health + ?) WHERE id = ?', [refund.money, refund.energy, refund.health, req.player.id]);
      break;
    }
    await connection.execute('DELETE FROM player_actions WHERE id = ?', [active.id]);
    const snapshot = await playerSnapshot(connection, req.player.id);
    await connection.commit();
    res.json({ player: snapshot, message: 'Activity left. Any eligible partial refund was returned.' });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
});

module.exports = router;
