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

function initializeImageCropper(imageID, opts = {width: Infinity, height: Infinity, aspectRatio: 16/9}) {

    const image = document.getElementById(imageID);
    const cropper = new Cropper(image, {
        aspectRatio: opts.aspectRatio,
        crop(event) {
            console.log(event.detail.x);
            console.log(event.detail.y);
            console.log(event.detail.width);
            console.log(event.detail.height);
            console.log(event.detail.rotate);
            console.log(event.detail.scaleX);
            console.log(event.detail.scaleY);
        },
        maxWidth: opts.width,
        maxHeight: opts.height
    });
}

