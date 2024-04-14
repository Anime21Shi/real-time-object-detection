const video = document.getElementById("webcam");
const enableWebCamBtn = document.getElementById("webcamButton");
const disableWebCamBtn = document.getElementById("disableCamButton");
const demosSection = document.getElementById("demos");
const liveView = document.getElementById("liveView");

function getUserMediaSupported(){
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if(getUserMediaSupported){
    enableWebCamBtn.addEventListener("click", enableCam);
}else{
    console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event){
    if(!model){
        return;
    }


    event.target.classList.add("removed");

    navigator.mediaDevices.getUserMedia({
        video: true
    })
    .then(function(stream){
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictCam);
    })
    .catch(function(error){
        console.log(`Error : ${error}`);
    })

    let disableFunc =() => disableWebCamBtn.classList.remove("removed");
    setTimeout(disableFunc, 5000);
}

disableWebCamBtn.addEventListener("click", disableCam);

let children = [];

function disableCam(event){
    enableWebCamBtn.classList.remove("removed");
    event.target.classList.add("removed");

    let stream = video.srcObject;
    let tracks = stream.getTracks();
    tracks.forEach(track => {
        track.stop();
    });
    video.srcObject = null;

    // removes all the previous highlighting
    for(let i=0; i<children.length; i++){
        liveView.removeChild(children[i]);
    }
    children.splice(0);
}

let model = undefined;

cocoSsd.load().then(function(loadedModel){
    model = loadedModel;
 
    demosSection.classList.remove("invisible");
});



function predictCam(){
    model.detect(video).then((predictions) => {
        for(let i=0; i<children.length; i++){
            liveView.removeChild(children[i]);
        }
        children.splice(0);
        // looping through predictions
        for(let prediction of predictions){
            if(prediction.score > 0.66){
                const p = document.createElement("p");
                // console.log(prediction);
                p.innerText = prediction.class + ' ( ' + Math.round(parseFloat(prediction.score)*100) + ' % )';
                p.style = 'left: ' + prediction.bbox[0] + 'px; top: '
                    + (prediction.bbox[1] - 15) + 'px; width: ' 
                    + (prediction.bbox[2] - 10) + 'px;';

                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + prediction.bbox[0] + 'px; top: '
                    + prediction.bbox[1] + 'px; width: ' 
                    + prediction.bbox[2] + 'px; height: '
                    + prediction.bbox[3] + 'px;';
            
                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);
                
            }
        }
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictCam);
    });
}

