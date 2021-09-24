'use strict';

var localStream;
var pc;
var remoteStream;

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var sdpText = document.querySelector('#text_for_send_sdp');
var textToReceiveSdp = document.querySelector('#text_for_receive_sdp');

navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
}).then(gotStream)

function gotStream(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
    let pc_config = {"iceServers":[
        {"urls": "stun:stun.l.google.com:19302"},
        {"urls": "stun:stun1.l.google.com:19302"},
        {"urls": "stun:stun2.l.google.com:19302"}
      ]};
    pc = new RTCPeerConnection(pc_config);
    pc.addStream(localStream);
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onicecandidate = (event) => {
        let ready = !event.candidate
        if (ready) sdpText.value = JSON.stringify(pc.localDescription);
    };
}

function handleRemoteStreamAdded(event) {
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

function connect() {
    pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    })
}

function receveSdp() {
    let sdp = JSON.parse(textToReceiveSdp.value);

    if (sdp.type === 'offer') {
        pc.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
            pc.createAnswer().then((answer) => {
                pc.setLocalDescription(answer)
            });
        })
    } else if (sdp.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
}