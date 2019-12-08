class GameEvent {
    constructor(options) {
        this.name = options.name;
        this.prettyViewName = options.prettyViewName
        //Args should contains any necessary data for event
        //for example: if it is smartContract iteration- any values for web3
        this.args = options.args;
    } 
    
    getArgs() {
        if(this.args === null)
            throw new Error(`Args of gameEvent ${this.name} is NULL!!`);
        return this.args
    }
    setArgs(args) {
        this.args = args;
    }
}

module.exports = GameEvent;