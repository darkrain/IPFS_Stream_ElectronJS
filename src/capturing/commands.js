const DeviceCommands = {
    LINUX: ['v4l2-ctl', '--list-devices'],
    WINDOWS: ['-list_devices', 'true',
    '-f', 'dshow',
    '-i', 'dummy'],
    MAC: []
};

module.exports = {
    DeviceCommands
}