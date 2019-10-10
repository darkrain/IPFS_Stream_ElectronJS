const TESTS = [
    require('./appNavigatorDynamicTest')
];

function startTests() {
    TESTS.forEach(t => t.start());
}

module.exports = {
    startTests
}

