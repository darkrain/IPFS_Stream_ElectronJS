const DeviceCommands = {
    LINUX: ['--list-devices'],
    WINDOWS: ['-list_devices', 'true',
    '-f', 'dshow',
    '-i', 'dummy'],
    MAC: []
};

module.exports = {
    DeviceCommands
}