const GameEvent = require('./GameEvent');

const GameDataEvents = {
    smartContractGame: new GameEvent({name: 'smartContractGame',
     prettyViewName: 'Смарт-Челлендж', args: [
         {
            name: 'betValue',
            prettyViewName: 'Ставка ETH',
            value: 0.01
         }
     ]}),
     
    testGameEvent: new GameEvent({name: 'testGameEvent', prettyViewName: 'Пустышка', args: null})
}

module.exports = GameDataEvents