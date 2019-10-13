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
				.attr("value",value)
				.text(value));
	});
}