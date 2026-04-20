const { oracle } = require('./backend/src/engine/OracleLogicMap');
const card = oracle.getCard('Soaring Stoneglider');
console.log(JSON.stringify(card, null, 2));
