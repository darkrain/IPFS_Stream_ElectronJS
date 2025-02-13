const DeviceCommands = {
    LINUX: ['--list-devices'],
    WINDOWS: ['-list_devices', 'true',
    '-f', 'dshow',
    '-i', 'dummy'],
    MAC: [] //TODO complete MAC logic
};

const KEYS = {
    CAM_KEY: 'CAM',
    AUDIO_KEY: 'AUDIO'
};

//DONT FORGET PUSH PATH TO PLAYLIST AFTER GET IT! In getters functions!
function getSplittedLinuxCommand() {
    
    const command = `-f v4l2 -video_size 640x480 -i ${KEYS.CAM_KEY} -f alsa -i default -c:v libx264 -preset ultrafast -c:a aac -f hls -pix_fmt yuv420p -hls_time 4 -hls_playlist_type event`;
    return command.split(" ");
}

function getWindowsDshowCommand() {
    const commands = [
        '-f' , 'dshow',
        '-i', `${KEYS.CAM_KEY}`, 
        '-profile:v', 'high422', //set profile to support 4:2:2 resolution
        '-level', '3.0',
        '-c:v', 'libx264',
        '-crf','20', //crf is video qualiti from 1(best) to 51 (worst)
        '-maxrate', '1M',
        '-bufsize', '2M',
        '-preset','veryfast',
        '-c:a', 'aac', 
        '-b:a', '128k', 
        '-ac','2',
        '-f', 'hls', 
        '-pix_fmt', 'yuv420p', //to support 4:2:2 resoultion
        '-hls_list_size', '1000000',
        '-hls_time', '20',
        '-hls_playlist_type', 'event', 
    ];
    return commands;
}

//NOTE: this commands not including output path!!!
const RecordCommands = {
    //TODO is just for test
    LINUX: getSplittedLinuxCommand(),
    WINDOWS: getWindowsDshowCommand(),
    MAC: [] //TODO complete MAC logic
};

module.exports = {
    DeviceCommands,
    RecordCommands,
    KEYS
};