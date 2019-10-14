const electron = require('electron');
const ipc = electron.ipcRenderer;
const requestUrl = 'http://localhost:4000/user';


$( document ).ready(function() {
    let currentImageCropper = null;
    const imageOpts = {
        width: 200,
        height: 200,
        aspectRatio: 4 / 4
    };
    $('#userAvaImg').click(() => {
        $('#chooiseUserAvaBtn').click()
    });

    $('#chooiseUserAvaBtn').change((event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            console.log(`image data loaded! : ${reader.result.substr(0, 35)}`);
            $('#userAvaImg').attr('src', reader.result)
            $('[name="photoBase64"]').val( reader.result ); //remove unecessary data for user
            currentImageCropper = initializeImageCropper('userAvaImg', imageOpts);
        };
        reader.onerror = (err) => {
            //TODO handle error
        }
    });


    $('form').submit((event) => {
        event.preventDefault();

        if(currentImageCropper) {
            const croppedData = currentImageCropper.getCroppedCanvas({maxWidth: imageOpts.width, maxHeight: imageOpts.height}).toDataURL('image/jpeg');
            console.log(`Cropped data: \n ${croppedData.substr(0,50)}`);
            $('[name="photoBase64"]').val( croppedData );
        }

        let form = $(event.target);
        let formData = getFormData(form);
        sendFormData(requestUrl, formData, (result) => {
            if(result.status === 'SUCCESS'){
                ipc.send('openGlobalRoomPage');
            }else{
                let textErr = '';
                for( i in result.body ){
                    textErr += result.body[i].name+", ";
                }
                toastr["error"](textErr, "Не заполнены поля")
            }
                
        });
    });
});
