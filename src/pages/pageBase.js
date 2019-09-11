class PageBase {
    constructor() {
        this.isEnabled = true;
    };
    stop() {
        this.isEnabled = false;
    }
    setEnabled(isEnabled) {
        this.isEnabled = isEnabled;
    }
    isEnabled() {
        return this.isEnabled;
    }
}

module.exports = PageBase;