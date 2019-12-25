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

function getDataUrl(img) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
  
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  
    // If the image is not png, the format
    // must be specified here
    return canvas.toDataURL()
  }

