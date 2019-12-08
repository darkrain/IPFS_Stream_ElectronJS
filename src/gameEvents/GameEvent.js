class GameEvent {
    constructor(name, args = null) {
        this.name = name;
        //Args should contains any necessary data for event
        //for example: if it is smartContract iteration- any values for web3
        this.args = args;
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