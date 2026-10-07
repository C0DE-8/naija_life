import api from './api'
import { demoBankTransfer, demoChooseCharacter, demoCollectPropertyIncome, demoFinishActivity, getDemoActivities, getDemoDashboard, getDemoCharacters, demoLeaveActivity, demoPurchaseListing, demoStartActivity, getDemoOwnedVehicles, demoUpgradeVehicle, isLocalDemo } from './demo'

export const getDashboard = () => isLocalDemo() ? getDemoDashboard() : api.get('/game/dashboard').then(({ data }) => data)
export const getActivities = () => isLocalDemo() ? getDemoActivities() : api.get('/game/activities').then(({ data }) => data)
export const bankTransfer = (operation, amount) => isLocalDemo() ? demoBankTransfer(operation, amount) : api.post(`/game/bank/${operation}`, { amount }).then(({ data }) => data)
export const startActivity = (kind, id) => isLocalDemo() ? demoStartActivity(kind, id) : api.post(`/game/actions/${kind}/start`, { id }).then(({ data }) => data)
export const finishActivity = () => isLocalDemo() ? demoFinishActivity() : api.post('/game/actions/finish').then(({ data }) => data)
export const leaveActivity = () => isLocalDemo() ? demoLeaveActivity() : api.post('/game/actions/leave').then(({ data }) => data)
export const purchaseListing = (kind, id) => isLocalDemo() ? demoPurchaseListing(kind, id) : api.post(`/game/purchases/${kind}/${id}`).then(({ data }) => data)
export const collectPropertyIncome = (id) => isLocalDemo() ? demoCollectPropertyIncome(id) : api.post(`/game/properties/${id}/collect`).then(({ data }) => data)
export const getCharacters = () => isLocalDemo() ? getDemoCharacters() : api.get('/game/characters').then(({ data }) => data)
export const chooseCharacter = (id) => isLocalDemo() ? demoChooseCharacter(id) : api.post('/game/character', { id }).then(({ data }) => data)
export const getOwnedVehicles = () => isLocalDemo() ? getDemoOwnedVehicles() : api.get('/game/vehicles/owned').then(({ data }) => data)
export const upgradeVehicle = (id, stat) => isLocalDemo() ? demoUpgradeVehicle(id, stat) : api.post(`/game/vehicles/${id}/upgrade`, { stat }).then(({ data }) => data)
