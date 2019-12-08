const GameEvent = require('./GameEvent');

const GameDataEvents = {
    smartContractGame: new GameEvent({name: 'smartContractGame',
     prettyViewName: 'Смарт-Челлендж', args: null}),
     
    testGameEvent: new GameEvent({name: 'testGameEvent', prettyViewName: 'Пустышка', args: null})
}

module.exports = GameDataEvents