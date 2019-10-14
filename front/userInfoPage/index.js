const electron = require('electron');
const ipc = electron.ipcRenderer;
const requestUrl = 'http://localhost:4000/user';


$( document ).ready(function() {

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
            initializeImageCropper('userAvaImg');
        };
        reader.onerror = (err) => {
            //TODO handle error
        }
    });


    $('form').submit((event) => {
        event.preventDefault();

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
