function getFormData(form){
    var data = {};

    form.serializeArray().forEach(function(item){
        data[item.name] = item.value;
    })

    return data;
}

function sendFormData(url, formData, callback) {    
    $.post( url, formData)
        .done(function( data ) {
            console.log({request: formData, response: data })
            callback(data)
        })
        .fail(function () {
            alert("ERROR");
        });
}

function initializeSelectionData(selectionID, valuesArr) {
	$(selectionID).empty();

	$.each(valuesArr, function(key, value) {
		$(selectionID)
			.append($("<option></option>")
				.attr("value",value.key)
				.text(value.name));
	});
}

function initializeImageCropper(imageID, opts = {aspectRatio: 16/9}) {

    const image = document.getElementById(imageID);
    const cropper = new Cropper(image, {
        aspectRatio: opts.aspectRatio,
        crop(event) {
            //console.log(event.detail.x);
            //console.log(event.detail.y);
            //console.log(event.detail.width);
            //console.log(event.detail.height);
            //console.log(event.detail.rotate);
            //console.log(event.detail.scaleX);
            //console.log(event.detail.scaleY);
        }
    });
    return cropper;
}

//CONVERT IMG TO BASE64 fUNC
function getDataUrl(img) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // If the image is not png, the format
    // must be specified here
    return canvas.toDataURL();
}

//load VIDEO player by URL
// args: videoElem = may be id string or HTMLElement
function loadVideoByTag(url, videoElem, specificConfig = null, volume = 1) {
    const httpPath = url;
    console.log(`Try to get video from url:${httpPath}`);
    
    let video = null;
    if(typeof(videoElem) === 'string' ) {
        video = document.getElementById(videoElem);
    } 
    if(videoElem instanceof HTMLElement) {
        video = videoElem;
    }

    if(video === null) {
        throw new Error(`CANNOT PARSE videoElem type! It should be HTMLElement or STRING!`);
    }

	if(Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(httpPath);
    hls.attachMedia(video);
    
    if(specificConfig !== null) {
        changeVideoConfig(hls.config, specificConfig);
    }  else {
        //Default config, more info: https://github.com/video-dev/hls.js/blob/master/docs/API.md#startposition
        const defaultConfig = {
            maxBufferHole: 1,
            fragLoadingMaxRetry: 1,
            levelLoadingMaxRetry: 1,
            liveSyncDurationCount: 1,
            maxMaxBufferLength: 1000,
            maxStarvationDelay: 2,
            maxLoadingDelay: 2,
            fpsDroppedMonitoringPeriod: 2500,
            fpsDroppedMonitoringThreshold: 0.1,
            manifestLoadingTimeOut : 5000,
            levelLoadingTimeOut: 5000,
            fragLoadingTimeOut: 10000,
            startPosition: 0
        };
        

        changeVideoConfig(hls.config, defaultConfig)
    }

    hls.on(Hls.Events.MANIFEST_PARSED, () => {						
        video.play();
        video.volume = volume;
    });
	}
}

function changeVideoConfig(baseConfig, newConfig) {
    for(let keyOfSpecificConfig in newConfig) {
        if(baseConfig[keyOfSpecificConfig]) {
            baseConfig[keyOfSpecificConfig] = newConfig[keyOfSpecificConfig];
            //console.log(`HLS config key ${keyOfSpecificConfig} changed to: ${baseConfig[keyOfSpecificConfig]}!`)
        }
    }  
}

function chatSendMsgByEnterInitialization(inputElement, buttonElement) {
    inputElement.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          buttonElement.click();
        }
      }); 
}



