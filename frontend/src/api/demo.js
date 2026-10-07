const DEMO_MODE = 'naijaLifeDemoMode'
const DEMO_STATE = 'naijaLifeDemoState'
const demoPlayer = { id: 2, username: 'demo', email: 'demo@mail.com', avatar: 'images/icons/default-avatar.jpg', role: 'Player', level: 4, money: 2425, gold: 4, respect: 1625, health: 100, energy: 100, power: 10, agility: 0, endurance: 10, intelligence: 0, characterId: 6, bank: 0, spins: 2, theme: 1, language: 'en' }

const activities = {
  jobs: [
    { id: 1, name: 'Part-Time Job', energyCost: 40, healthLoss: 20, format: 'Hours', time: 4, money: 1600, gold: 0 },
    { id: 2, name: 'Full-Time Job', energyCost: 60, healthLoss: 40, format: 'Hours', time: 8, money: 3200, gold: 1 },
    { id: 3, name: 'Temporary / Seasonal Work', energyCost: 100, healthLoss: 60, format: 'Hours', time: 24, money: 8100, gold: 4 },
    { id: 4, name: 'Project', energyCost: 80, healthLoss: 50, format: 'Hours', time: 16, money: 5300, gold: 2 },
  ],
  gym: [
    { id: 1, name: 'Stretching', power: 0, agility: 5, endurance: 2, energyCost: 10, healthRestore: 15, fee: 150, time: 15, format: 'Minutes' },
    { id: 2, name: 'Short Workout', power: 2, agility: 0, endurance: 1, energyCost: 20, healthRestore: 30, fee: 300, time: 30, format: 'Minutes' },
    { id: 3, name: 'Normal Workout', power: 4, agility: 0, endurance: 2, energyCost: 30, healthRestore: 45, fee: 500, time: 1, format: 'Hours' },
    { id: 4, name: 'Full Workout', power: 6, agility: 3, endurance: 4, energyCost: 70, healthRestore: 80, fee: 650, time: 2, format: 'Hours' },
  ],
  school: [
    { id: 1, name: 'Maths', energyCost: 15, intelligence: 3, fee: 350, time: 45, format: 'Minutes' },
    { id: 2, name: 'Music', energyCost: 15, intelligence: 3, fee: 350, time: 45, format: 'Minutes' },
    { id: 6, name: 'Information Technology', energyCost: 20, intelligence: 5, fee: 500, time: 1, format: 'Hours' },
  ],
  hospital: [
    { id: 1, name: 'Therapy', cost: 250, time: 30, format: 'Minutes', healthRestore: 50 },
    { id: 2, name: 'Full Treatment', cost: 500, time: 1, format: 'Hours', healthRestore: 100 },
  ],
}

const catalogs = {
  vehicles: [
    { id: 1, name: 'City bicycle', category: 'Bicycles & Motorbikes', image: 'images/vehicles/bicycles/1.png', speed: 10, acceleration: 5, stability: 5, money: 500, gold: 0, minLevel: 1, respect: 500 },
    { id: 38, name: 'Street motorbike', category: 'Bicycles & Motorbikes', image: 'images/vehicles/motorbikes/1.png', speed: 80, acceleration: 95, stability: 60, money: 5000, gold: 0, minLevel: 1, respect: 1150 },
    { id: 11, name: 'City sedan', category: 'Cars & SUVs', image: 'images/vehicles/cars/2.png', speed: 80, acceleration: 50, stability: 45, money: 5000, gold: 0, minLevel: 6, respect: 4000 },
    { id: 53, name: 'Motor boat', category: 'Boats & Ships', image: 'images/vehicles/boats/1.png', speed: 120, acceleration: 85, stability: 70, money: 35000, gold: 5, minLevel: 5, respect: 5000 },
  ],
  properties: [
    { id: 1, name: 'Shop', image: 'images/properties/Shop.png', money: 3000, gold: 0, minLevel: 1, respect: 1000, income: 500, format: 'Minutes', time: 15 },
    { id: 2, name: 'Cafe', image: 'images/properties/Cafe.png', money: 6000, gold: 0, minLevel: 2, respect: 2000, income: 950, format: 'Minutes', time: 30 },
    { id: 3, name: 'Old House', image: 'images/properties/Old-House.png', money: 14000, gold: 0, minLevel: 4, respect: 3500, income: 1600, format: 'Hours', time: 1 },
    { id: 4, name: 'Small House', image: 'images/properties/Small-House.png', money: 25000, gold: 1, minLevel: 6, respect: 5000, income: 5000, format: 'Hours', time: 3 },
  ],
  pets: [
    { id: 1, name: 'Cat', image: 'images/pets/cat.png', money: 500, gold: 0, respect: 500, minLevel: 1, bonusType: 'agility', bonusValue: 5 },
    { id: 2, name: 'Dog', image: 'images/pets/dog.png', money: 3000, gold: 1, respect: 3800, minLevel: 2, bonusType: 'power', bonusValue: 5 },
    { id: 3, name: 'Bolt', image: 'images/pets/robot1.png', money: 6800, gold: 2, respect: 7120, minLevel: 6, bonusType: 'endurance', bonusValue: 10 },
  ],
  shop: [
    { id: 1, name: 'Baseball Bat', category: 'Weapons', image: 'images/items/weapons/baseball-bat.png', bonusType: 'power', bonusValue: 1, money: 150, gold: 0, minLevel: 1, respect: 100 },
    { id: 28, name: 'Paper Bag', category: 'Bags', image: 'images/items/bags/paper-bag.png', bonusType: 'agility', bonusValue: 5, money: 500, gold: 0, minLevel: 2, respect: 900 },
    { id: 55, name: 'Tea', category: 'Drinks', image: 'images/items/drinks/tea.png', bonusType: 'energy', bonusValue: 5, money: 250, gold: 0, minLevel: 1, respect: 500 },
  ],
  resources: [
    { id: 1, name: 'Cash Pack [Mini]', image: 'images/icons/cash1.png', type: 'getmoney', amount: 25000, cost: 2, currency: 'EUR' },
    { id: 5, name: 'Gold Pack [Mini]', image: 'images/icons/gold1.png', type: 'getgold', amount: 60, cost: 2, currency: 'EUR' },
    { id: 9, name: 'Energy Pack', image: 'images/icons/energy.png', type: 'energyrefill', amount: 100, cost: 2, currency: 'EUR' },
  ],
  leaderboard: [demoPlayer, { id: 1, username: 'cityboss', level: 8, respect: 9780, power: 40, agility: 25, endurance: 30, intelligence: 18 }],
  casino: [{ id: 1, prizeType: 'Money', value: 1500, color: '#18d23e' }, { id: 2, prizeType: 'Gold', value: 15, color: 'orange' }, { id: 3, prizeType: 'Respect', value: 300, color: '#dd30cf' }, { id: 4, prizeType: 'Energy', value: 100, color: '#21cece' }, { id: 5, prizeType: 'Health', value: 100, color: 'red' }],
  races: [{ id: 3, username: 'cityboss', level: 8, respect: 9780 }, { id: 4, username: 'lagoslegend', level: 5, respect: 3900 }],
  fights: [{ id: 3, username: 'cityboss', level: 8, respect: 9780, power: 40, agility: 25, endurance: 30 }, { id: 4, username: 'lagoslegend', level: 5, respect: 3900, power: 16, agility: 14, endurance: 19 }],
  'home-upgrades': [{ id: 1, name: 'Home 1', image: 'images/backgrounds/homes/1.jpg', money: 500, gold: 0, minLevel: 1, respect: 300, capacity: 0 }, { id: 2, name: 'Home 2', image: 'images/backgrounds/homes/2.jpg', money: 1500, gold: 0, minLevel: 1, respect: 300, capacity: 1 }, { id: 3, name: 'Home 3', image: 'images/backgrounds/homes/3.jpg', money: 3000, gold: 0, minLevel: 2, respect: 300, capacity: 1 }],
  'garage-upgrades': [{ id: 1, name: 'Garage 1', image: 'images/backgrounds/garages/1.jpg', money: 5000, gold: 0, minLevel: 1, respect: 1000, capacity: 1 }, { id: 2, name: 'Garage 2', image: 'images/backgrounds/garages/2.jpg', money: 12500, gold: 1, minLevel: 3, respect: 3000, capacity: 2 }],
  'hangar-upgrades': [{ id: 1, name: 'Hangar 1', image: 'images/backgrounds/hangars/1.jpg', money: 40000, gold: 15, minLevel: 7, respect: 5000, capacity: 1 }],
  'quay-upgrades': [{ id: 1, name: 'Quay 1', image: 'images/backgrounds/quays/1.jpg', money: 120000, gold: 25, minLevel: 12, respect: 9500, capacity: 1 }],
}
const characters = [
  { id: 1, name: 'Businessman', categoryId: 1, image: 'images/characters/male/businessman.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 2, name: 'Doctor', categoryId: 1, image: 'images/characters/male/doctor.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 3, name: 'Builder', categoryId: 1, image: 'images/characters/male/builder.png', power: 'Yes', endurance: 'Yes' },
  { id: 4, name: 'Policeman', categoryId: 1, image: 'images/characters/male/policeman.png', power: 'Yes', endurance: 'Yes' },
  { id: 5, name: 'Singer', categoryId: 1, image: 'images/characters/male/singer.png', agility: 'Yes', endurance: 'Yes' },
  { id: 6, name: 'Courier', categoryId: 1, image: 'images/characters/male/courier.png', power: 'Yes', endurance: 'Yes' },
  { id: 7, name: 'Programmer', categoryId: 1, image: 'images/characters/male/programmer.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 8, name: 'Superhero', categoryId: 1, image: 'images/characters/male/superhero.png', power: 'Yes', agility: 'Yes', endurance: 'Yes' },
  { id: 9, name: 'Businesswoman', categoryId: 2, image: 'images/characters/female/businesswoman.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 10, name: 'Doctor', categoryId: 2, image: 'images/characters/female/doctor.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 11, name: 'Chef', categoryId: 2, image: 'images/characters/female/chef.png', agility: 'Yes', endurance: 'Yes' },
  { id: 12, name: 'Model', categoryId: 2, image: 'images/characters/female/model.png', agility: 'Yes', endurance: 'Yes' },
  { id: 13, name: 'Programmer', categoryId: 2, image: 'images/characters/female/programmer.png', intelligence: 'Yes', endurance: 'Yes' },
  { id: 14, name: 'Secretary', categoryId: 2, image: 'images/characters/female/secretary.png', agility: 'Yes', intelligence: 'Yes' },
  { id: 15, name: 'Teacher', categoryId: 2, image: 'images/characters/female/teacher.png', intelligence: 'Yes', endurance: 'Yes' },
]

export function isLocalDemo() { return localStorage.getItem(DEMO_MODE) === 'true' }

export function enterLocalDemo() {
  localStorage.setItem(DEMO_MODE, 'true')
  localStorage.setItem('naijaLifeToken', 'demo-local-session')
  localStorage.setItem('naijaLifePlayer', JSON.stringify(demoPlayer))
  if (!localStorage.getItem(DEMO_STATE)) localStorage.setItem(DEMO_STATE, JSON.stringify({ player: demoPlayer, activeAction: null, properties: [] }))
  return { token: 'demo-local-session', player: demoPlayer, demo: true }
}

export function resetLocalDemo() {
  const fresh = { player: demoPlayer, activeAction: null, properties: [] }
  localStorage.setItem(DEMO_STATE, JSON.stringify(fresh))
  localStorage.setItem('naijaLifePlayer', JSON.stringify(demoPlayer))
}

function state() {
  try { return JSON.parse(localStorage.getItem(DEMO_STATE)) || { player: demoPlayer, activeAction: null, properties: [] } }
  catch { return { player: demoPlayer, activeAction: null, properties: [] } }
}

function save(next) {
  localStorage.setItem(DEMO_STATE, JSON.stringify(next))
  localStorage.setItem('naijaLifePlayer', JSON.stringify(next.player))
  return next
}

function demoError(message) { return { message, response: { data: { message } } } }
export function getDemoCatalog(kind) {
  const current = state()
  const ownedIds = kind === 'properties' ? current.properties.map((item) => item.id) : kind === 'pets' ? current.pets || [] : kind === 'shop' ? current.items || [] : kind === 'vehicles' ? current.vehicles || [] : []
  const selectedId = ({ 'home-upgrades': current.homeId || 1, 'garage-upgrades': current.garageId || 0, 'hangar-upgrades': current.hangarId || 0, 'quay-upgrades': current.quayId || 0 })[kind]
  const items = (catalogs[kind] || []).map((item) => ({ ...item, owned: ownedIds.includes(item.id) || (selectedId !== undefined && selectedId === item.id), profittime: current.properties.find((property) => property.id === item.id)?.profittime }))
  return Promise.resolve({ items })
}
export function getDemoCharacters() { return Promise.resolve({ categories: [{ id: 1, name: 'Male Characters' }, { id: 2, name: 'Female Characters' }], characters }) }
export async function demoChooseCharacter(id) {
  const current = state()
  const character = characters.find((item) => item.id === Number(id))
  if (!character) throw demoError('Character not found.')
  if (current.player.characterId) throw demoError('Your character has already been selected.')
  for (const stat of ['power', 'agility', 'endurance', 'intelligence']) {
    if (character[stat] === 'Yes') current.player[stat] = Math.min(250, current.player[stat] + 10)
  }
  current.player.characterId = character.id
  save(current)
  return { player: current.player, message: `${character.name} selected.` }
}
export function getDemoActivities() { return Promise.resolve(activities) }

export function getDemoDashboard() {
  const current = state()
  const nextLevelRespect = ({ 1: 500, 2: 1000, 3: 1500, 4: 3000, 5: 5000, 6: 7500, 7: 9780 }[current.player.level] || null)
  const levelsGained = current.player.respect >= (nextLevelRespect || Infinity) ? 1 : 0
  if (levelsGained) current.player = { ...current.player, level: current.player.level + 1, energy: 100, money: current.player.money + 1000, gold: current.player.gold + 2 }
  save(current)
  const activeAction = current.activeAction ? { ...current.activeAction, secondsLeft: Math.max(0, current.activeAction.finishAt - Math.floor(Date.now() / 1000)) } : null
  return Promise.resolve({ player: current.player, activeAction, nextLevelRespect, levelsGained, online_players: 1, total_players: 3, properties: current.properties })
}

export async function demoBankTransfer(operation, rawAmount) {
  const amount = Number(rawAmount)
  const current = state()
  if (!Number.isSafeInteger(amount) || amount <= 0) throw demoError('Enter a positive whole number.')
  if (operation === 'deposit' && current.player.money < amount) throw demoError('You do not have enough cash.')
  if (operation === 'withdraw' && current.player.bank < amount) throw demoError('Your bank balance is too low.')
  current.player = { ...current.player, money: current.player.money + (operation === 'deposit' ? -amount : amount), bank: current.player.bank + (operation === 'deposit' ? amount : -amount) }
  save(current)
  return { player: current.player, message: operation === 'deposit' ? 'Cash deposited in demo mode.' : 'Cash withdrawn in demo mode.' }
}

export async function demoStartActivity(kind, id) {
  const current = state()
  if (current.activeAction) throw demoError(`Finish or leave ${current.activeAction.type} first.`)
  const item = (activities[kind === 'job' ? 'jobs' : kind] || []).find((option) => option.id === Number(id))
  if (!item) throw demoError('Activity was not found.')
  const fee = item.fee ?? item.cost ?? 0
  if (current.player.energy < (item.energyCost || 0)) throw demoError('You need more energy.')
  if (current.player.health < (item.healthLoss || 0)) throw demoError('Your health is too low.')
  if (current.player.money < fee) throw demoError('You do not have enough cash.')
  if (kind === 'hospital' && current.player.health >= 100) throw demoError('Your health is already full.')
  current.player = { ...current.player, energy: current.player.energy - (item.energyCost || 0), health: current.player.health - (item.healthLoss || 0), money: current.player.money - fee }
  const finishAt = Math.floor(Date.now() / 1000) + 20
  current.activeAction = { id: item.id, kind, type: item.name, finishAt, item }
  save(current)
  return { player: current.player, activeAction: current.activeAction, message: `${item.name} started. Demo activities take 20 seconds.` }
}

export async function demoFinishActivity() {
  const current = state()
  const active = current.activeAction
  if (!active) throw demoError('You have no active activity.')
  if (active.finishAt > Math.floor(Date.now() / 1000)) throw demoError('This activity is not finished yet.')
  const item = active.item
  if (active.kind === 'job') current.player = { ...current.player, money: current.player.money + item.money, gold: current.player.gold + item.gold }
  if (active.kind === 'gym') current.player = { ...current.player, power: Math.min(250, current.player.power + item.power), agility: Math.min(250, current.player.agility + item.agility), endurance: Math.min(250, current.player.endurance + item.endurance), health: Math.min(100, current.player.health + item.healthRestore) }
  if (active.kind === 'school') current.player = { ...current.player, intelligence: Math.min(250, current.player.intelligence + item.intelligence) }
  if (active.kind === 'hospital') current.player = { ...current.player, health: Math.min(100, current.player.health + item.healthRestore) }
  current.activeAction = null
  save(current)
  return { player: current.player, message: `${active.type} completed in demo mode.` }
}

export async function demoLeaveActivity() {
  const current = state()
  const active = current.activeAction
  if (!active) throw demoError('You have no active activity.')
  if (active.finishAt <= Math.floor(Date.now() / 1000)) throw demoError('Collect the finished activity instead.')
  const item = active.item
  const moneyBack = Math.floor((item.fee ?? item.cost ?? 0) / 2)
  const energyBack = Math.floor((item.energyCost || 0) / 2)
  const healthBack = active.kind === 'job' ? Math.floor((item.healthLoss || 0) / 2) : 0
  current.player = { ...current.player, money: current.player.money + moneyBack, energy: Math.min(100, current.player.energy + energyBack), health: Math.min(100, current.player.health + healthBack) }
  current.activeAction = null
  save(current)
  return { player: current.player, message: 'Activity left. Any eligible partial refund was returned.' }
}

export async function demoPurchaseListing(kind, id) {
  const current = state()
  const catalogKey = ({ vehicle: 'vehicles', property: 'properties', pet: 'pets', item: 'shop', home: 'home-upgrades', garage: 'garage-upgrades', hangar: 'hangar-upgrades', quay: 'quay-upgrades' })[kind]
  const item = (catalogs[catalogKey] || []).find((entry) => entry.id === Number(id))
  if (!item) throw demoError('Listing was not found.')
  if (current.player.level < (item.minLevel || 1)) throw demoError(`You need level ${item.minLevel} to get this.`)
  if (current.player.money < item.money || current.player.gold < item.gold) throw demoError('You do not have enough money or gold.')
  const owned = await getDemoCatalog(catalogKey)
  if (owned.items.find((entry) => entry.id === item.id)?.owned) throw demoError('You already own this listing.')

  if (kind === 'property') {
    current.player.money -= item.money; current.player.gold -= item.gold; current.player.respect += item.respect
    current.properties.push({ id: item.id, profittime: Math.floor(Date.now() / 1000) + item.time * (item.format === 'Hours' ? 3600 : 60), income: item.income, time: item.time, format: item.format, name: item.name })
  } else if (kind === 'home' || kind === 'garage' || kind === 'hangar' || kind === 'quay') {
    current.player.money -= item.money; current.player.gold -= item.gold; current.player.respect += item.respect
    current[`${kind}Id`] = item.id
    if (kind === 'home') current.homeCapacity = item.capacity
  } else if (kind === 'pet') {
    const capacity = current.homeCapacity ?? 0
    if ((current.pets || []).length >= capacity) throw demoError('Upgrade your home to make room for a pet.')
    current.player.money -= item.money; current.player.gold -= item.gold; current.player.respect += item.respect
    current.pets = [...(current.pets || []), item.id]
    current.player[item.bonusType] = Math.min(250, (current.player[item.bonusType] || 0) + item.bonusValue)
  } else if (kind === 'item') {
    const singleUse = ['energy', 'health'].includes(item.bonusType)
    if (!singleUse && (current.items || []).includes(item.id)) throw demoError('You already own this item.')
    if (item.bonusType === 'energy' && current.player.energy >= 100) throw demoError('Your energy is already full.')
    if (item.bonusType === 'health' && current.player.health >= 100) throw demoError('Your health is already full.')
    current.player.money -= item.money; current.player.gold -= item.gold; current.player.respect += item.respect
    current.player[item.bonusType] = Math.min(['energy', 'health'].includes(item.bonusType) ? 100 : 250, (current.player[item.bonusType] || 0) + item.bonusValue)
    if (!singleUse) current.items = [...(current.items || []), item.id]
  } else if (kind === 'vehicle') {
    const categoryType = item.category === 'Helicopters & Planes' ? 'hangar' : item.category === 'Boats & Ships' ? 'quay' : 'garage'
    const capacityItem = (catalogs[`${categoryType}-upgrades`] || []).find((entry) => entry.id === current[`${categoryType}Id`])
    if (!capacityItem) throw demoError(`Buy a ${categoryType} before buying this vehicle.`)
    const stored = current.vehicles || []
    const matching = stored.filter((vehicleId) => {
      const storedItem = catalogs.vehicles.find((vehicle) => vehicle.id === vehicleId)
      return storedItem?.category === item.category
    })
    if (matching.length >= capacityItem.capacity) throw demoError('There is no free space for this vehicle.')
    current.player.money -= item.money; current.player.gold -= item.gold; current.player.respect += item.respect
    current.vehicles = [...stored, item.id]
  }
  save(current)
  return { player: current.player, message: `${item.name} added to your demo city.` }
}

export async function demoCollectPropertyIncome(id) {
  const current = state()
  const property = current.properties.find((entry) => entry.id === Number(id))
  if (!property) throw demoError('You do not own this property.')
  if (property.profittime > Math.floor(Date.now() / 1000)) throw demoError('Property income is not ready yet.')
  current.player.money += property.income
  property.profittime = Math.floor(Date.now() / 1000) + property.time * (property.format === 'Hours' ? 3600 : 60)
  save(current)
  return { player: current.player, message: `Collected $${property.income} property income.` }
}

export function getDemoOwnedVehicles() {
  const current = state()
  return Promise.resolve({ vehicles: (current.vehicles || []).map((id) => {
    const item = catalogs.vehicles.find((vehicle) => vehicle.id === id)
    return item ? { ...item, ...(current.vehicleStats?.[id] || {}) } : null
  }).filter(Boolean) })
}

export async function demoUpgradeVehicle(id, stat) {
  if (!['speed', 'acceleration', 'stability'].includes(stat)) throw demoError('Choose a valid vehicle stat.')
  const current = state()
  const owned = (current.vehicles || []).includes(Number(id))
  const vehicle = catalogs.vehicles.find((item) => item.id === Number(id))
  if (!owned || !vehicle) throw demoError('You do not own this vehicle.')
  const currentStat = Number(current.vehicleStats?.[id]?.[stat] ?? vehicle[stat])
  const cost = currentStat * 8
  if (currentStat + 1 > 500) throw demoError('This vehicle stat is already at its limit.')
  if (current.player.money < cost) throw demoError(`You need $${cost} for this upgrade.`)
  current.vehicleStats = { ...(current.vehicleStats || {}), [id]: { ...(current.vehicleStats?.[id] || {}), [stat]: currentStat + 1 } }
  current.player.money -= cost
  current.player.respect += 50
  save(current)
  return { player: current.player, message: `${stat} upgraded for $${cost} in demo mode.` }
}

export function getDemoMessages() { return Promise.resolve({ messages: state().messages || [] }) }
export async function demoSendMessage(username, content) {
  const text = String(content || '').trim()
  const recipient = String(username || '').trim()
  if (!recipient || !text || text.length > 1000) throw demoError('Enter a recipient and a message up to 1,000 characters.')
  const current = state()
  const message = { id: Date.now(), fromId: current.player.id, toId: 3, sender: current.player.username, recipient, content: text, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), viewed: 'No' }
  current.messages = [message, ...(current.messages || [])]
  save(current)
  return { message: 'Message saved in demo mode.' }
}
export async function demoReadMessage(id) {
  const current = state()
  current.messages = (current.messages || []).map((message) => message.id === Number(id) ? { ...message, viewed: 'Yes' } : message)
  save(current)
  return { message: 'Message marked as read.' }
}
export function saveDemoSettings(details) {
  const current = state()
  current.player = { ...current.player, email: details.email, avatar: details.avatar || current.player.avatar }
  save(current)
  return Promise.resolve({ message: 'Demo account settings saved locally.' })
}
export function saveDemoPreferences(details) {
  const current = state()
  current.player = { ...current.player, language: details.language, theme: Number(details.theme) }
  save(current)
  return Promise.resolve({ message: 'Demo preferences saved locally.' })
}
export async function demoSpin() {
  const current = state()
  if (current.player.spins < 1) throw demoError('You do not have any spins left.')
  const prize = catalogs.casino[Math.floor(Math.random() * catalogs.casino.length)]
  const effect = ({ Money: 'money', Gold: 'gold', Respect: 'respect', Energy: 'energy', Health: 'health' })[prize.prizeType]
  current.player.spins -= 1
  current.player[effect] = Math.min(['energy','health'].includes(effect) ? 100 : Number.MAX_SAFE_INTEGER, current.player[effect] + prize.value)
  save(current)
  return { prize: { type: prize.prizeType, value: prize.value, color: prize.color }, message: `You won ${prize.value} ${prize.prizeType.toLowerCase()}!` }
}
export async function demoBuySpins(quantity) {
  const current = state()
  const amount = Number(quantity)
  const cost = amount * 850
  if (!Number.isInteger(amount) || amount < 1 || amount > 10) throw demoError('Choose between 1 and 10 spins.')
  if (current.player.money < cost) throw demoError('You do not have enough money.')
  current.player.money -= cost
  current.player.spins += amount
  save(current)
  return { message: `${amount} demo spins purchased.` }
}
