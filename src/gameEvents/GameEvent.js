class GameEvent {
    constructor(options) {
        this.name = options.name;
        this.prettyViewName = options.prettyViewName
        //Args should contains any necessary data for event
        //for example: if it is smartContract iteration- any values for web3
        this.betValue = options.betValue;
    } 
    
    getArgs() {
        if(this.betValue === null)
            throw new Error(`Args of gameEvent ${this.name} is NULL!!`);
        return this.betValue
    }
    setBetValue(betValue) {
        this.betValue = betValue;
    }
}

module.exports = GameEvent;