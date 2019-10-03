const DeviceCommands = {
    LINUX: ['--list-devices'],
    WINDOWS: ['-list_devices', 'true',
    '-f', 'dshow',
    '-i', 'dummy'],
    MAC: [] //TODO complete MAC logic
};

const KEYS = {
    CAM_KEY: 'CAM'
}

function getSplittedLinuxCommand() {
    //DONT FORGET PUSH PATH TO PLAYLIST AFTER GET IT!
    const command = `-f v4l2 -video_size 640x480 -i ${KEYS.CAM_KEY} -f alsa -i default -c:v libx264 -preset ultrafast -c:a aac -f hls -pix_fmt yuv420p -hls_time 4 -hls_playlist_type event`;
    return command.split(" ");
}

//NOTE: this commands not including output path!!!
const RecordCommands = {
    LINUX: getSplittedLinuxCommand(),
    WINDOWS: [], //TODO complete Windows logic
    MAC: [] //TODO complete MAC logic
}

module.exports = {
    DeviceCommands,
    RecordCommands,
    KEYS
}