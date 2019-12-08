class GameEvent {
    constructor(name, args) {
        this.name = name;
        //Args should contains any necessary data for event
        //for example: if it is smartContract iteration- any values for web3
        this.args = args;
    }   
}

module.exports = GameEvent;