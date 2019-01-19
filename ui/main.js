

		// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
    // Grab elements, create settings, etc.
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');
    var mediaConfig =  { video: true };
    var errBack = function(e) {
        console.log('An error has occurred!', e)
    };

    // Put video listeners into place
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
            //video.src = window.URL.createObjectURL(stream);
            video.srcObject = stream;
            video.play();
        });
    }

    /* Legacy code below! */
    else if(navigator.getUserMedia) { // Standard
        navigator.getUserMedia(mediaConfig, function(stream) {
            video.src = stream;
            video.play();
        }, errBack);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(mediaConfig, function(stream){
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
        }, errBack);
    } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
        navigator.mozGetUserMedia(mediaConfig, function(stream){
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, errBack);
    }
    var interval = setInterval(function(){
        context.drawImage(video, 0, 0, 640, 480);
        var img = document.createElement("img");
        var dataUrl = canvas.toDataURL();
        $.ajax({
            type: "POST",
            url: "/api/sendImage",
            data: {
                img: dataUrl
            }
        }).done(function(response){

        });
    }, 60000)
    // Trigger photo take
    document.getElementById('snap').addEventListener('click', function() {
        clearInterval(interval);
        /*
        var formData = new FormData;
        formData.append("avatar", $("#avatar")[0].files[0]);
        $.ajax({
            url: "/api/event/upload/" + response.event._id,
            method: "POST",
            data: formData,
            processData: false,
            contentType: false
        })
        .done(function(response){
            console.log(response);
        })
        */
    });
}, false);