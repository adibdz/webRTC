/*var sendChannel, receiveChannel;

var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function log(text) {
	console.log('At Time: ' + (performance.now() / 1000).toFixed(3) + ' ---> ' + text);
}

function createConnection() {
	if(navigator.webkitGetUserMedia) {
		RTCPeerConnection = webkitRTCPeerConnection;
	} else if(navigator.mozGetUserMedia) {
		RTCPeerConnection = mozRTCPeerConnection;
		RTCSessionDescription = mozRTCSessionDescription;
		RTCIceCandidate = mozRTCIceCandidate;
	}
	log('RTCPeerConnection object: ' + RTCPeerConnection);

	var servers = null;
	var pc_constraints = {
			'optional': [
				{'DtlsSrtpKeyAgreement': true}
		]};
	localPeerConnection = new RTCPeerConnection(servers, pc_constraints);
	log("Created local peer connection object, with Data Channel");

	try {
		sendChannel = localPeerConnection.createDataChannel("sendDataChannel", {reliable: true});
		log('Created reliable send data channel');
	} catch (e) {
		alert('Failed to create data channel!');
		log('createDataChannel() failed with following message: ' + e.message);
	}
	localPeerConnection.onicecandidate = gotLocalCandidate;
	
	sendChannel.onopen = handleSendChannelStateChange;
	sendChannel.onclose = handleSendChannelStateChange;

	window.remotePeerConnection = new RTCPeerConnection(servers, pc_constraints);
	log('Created remote peer connection object, with DataChannel');

	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	remotePeerConnection.ondatachannel = gotReceiveChannel;

	localPeerConnection.createOffer(gotLocalDescription,onSignalingError);

	startButton.disabled = true;
	closeButton.disabled = false;
}

function onSignalingError (error) {
	console.log('Failed to create signaling message: ' + error.name);
}

function gotLocalDescription (description) {
	localPeerConnection.setLocalDescription(description);
	log('Offer from localPeerConnection: \n' + description.sdp);

	remotePeerConnection.setRemoteDescription(description);
	remotePeerConnection.createAnswer(gotRemoteDescription, onSignalingError);
}

function gotRemoteDescription (description) {
	remotePeerConnection.setLocalDescription(description);
	log('Answer from remotePeerConnection: \n' + description.sdp);

	localPeerConnection.setRemoteDescription(description);
}

function gotLocalCandidate(event){
	log('local ice callback');
	if (event.candidate) {
		remotePeerConnection.addIceCandidate(event.candidate);
		log("Local ICE candidate: \n" + event.candidate.candidate);
	}
}

function gotRemoteIceCandidate(event){
	log('remote ice callback');
	if (event.candidate) {
		localPeerConnection.addIceCandidate(event.candidate);
		log("Remote ICE candidate: \n " + event.candidate.candidate);
	}
}

function sendData() {
	var data = document.getElementById("dataChannelSend").value;
	sendChannel.send(data);
	log('Sent data: ' + data);
}

function gotReceiveChannel(event) {
	log('Receive Channel Callback: event --> ' + event);
	receiveChannel = event.channel;

	receiveChannel.onopen = handleReceiveChannelStateChange; // handleSendChannelStateChange
	receiveChannel.onmessage = handleMessage;
	receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleSendChannelStateChange() {
	var readyState = sendChannel.readyState;
	log('Send channel state is: ' + readyState);
	if (readyState == "open") {
		dataChannelSend.disabled = false;
		dataChannelSend.focus();
		dataChannelSend.placeholder = "";
		sendButton.disabled = false;
		closeButton.disabled = false;
	} else {
		dataChannelSend.disabled = true;
		sendButton.disabled = true;
		closeButton.disabled = true;
	}
}

function handleMessage(event) {
	log('Received message: ' + event.data);
	document.getElementById("dataChannelReceive").value = event.data;
	document.getElementById("dataChannelSend").value = '';
}

function handleReceiveChannelStateChange() {
	var readyState = receiveChannel.readyState;
	log('Receive channel state is: ' + readyState);
}

function closeDataChannels() {
	log('Closing data channels');
	sendChannel.close();
	log('Closed data channel with label: ' + sendChannel.label);
	receiveChannel.close();
	log('Closed data channel with label: ' + receiveChannel.label);
	localPeerConnection.close();
	remotePeerConnection.close();
	localPeerConnection = null;
	remotePeerConnection = null;
	log('Closed peer connections');
	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;
	dataChannelSend.value = "";
	dataChannelReceive.value = "";
	dataChannelSend.disabled = true;
	dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}*/


var localStream, localPeerConnection, remotePeerConnection;

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");

startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

function log(text) {
	console.log('At Time: ' + (performance.now() / 1000).toFixed(3) + ' ---> ' + text);
}

function successCallback(stream) {
	log('Received local stream');
	if(window.URL) {
		localVideo.src = URL.createObjectURL(stream);
	} else {
		localVideo.src = stream;
	}
	localStream = stream;
	callButton.disabled = false;
}

function start() {
	log('Request local stream');
	startButton.disabled = true;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({audio: true, video: true}, successCallback, function (error) {
		log('navigator.getUserMedia error: ', error);
	});
}

function call() {
	callButton.disabled = true;
	hangupButton.disabled = false;
	log('Starting call');

	if(navigator.webkitGetUserMedia) {
		if(localStream.getVideoTracks().length > 0) {
			log('Using video device: ' + localStream.getVideoTracks()[0].label);
		} 
		if(localStream.getAudioTracks().length > 0) {
			log('Using audio device: ' + localStream.getAudioTracks()[0].label);	
		}
	}

	if(navigator.webkitGetUserMedia) {
		RTCPeerConnection = webkitRTCPeerConnection;
	} else if(navigator.mozGetUserMedia) {
		RTCPeerConnection = mozRTCPeerConnection;
		RTCSessionDescription = mozRTCSessionDescription;
		RTCIceCandidate = mozRTCIceCandidate;
	}
	log('RTCPeerConnection object: ' + RTCPeerConnection);

	var servers = null;
	
	localPeerConnection = new RTCPeerConnection(servers);
	log('Create local peer connection object localPeerConnection');
	localPeerConnection.onicecandidate = gotLocalIceCandidate;

	remotePeerConnection = new RTCPeerConnection(servers);
	log('Create remote peer connection object remotePeerConnection');
	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

	remotePeerConnection.onaddstream = gotRemoteStream;

	localPeerConnection.addStream(localStream);
	log('Added localStream to localPeerConnection');

	localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
}

function onSignalingError (error) {
	console.log('Failed to create signaling message: ' + error.name);
}

function gotLocalDescription (description) {
	localPeerConnection.setLocalDescription(description);
	log('Offer from localPeerConnection: \n' + description.sdp);

	remotePeerConnection.setRemoteDescription(description);
	remotePeerConnection.createAnswer(gotRemoteDescription, onSignalingError);
}

function gotRemoteDescription (description) {
	remotePeerConnection.setLocalDescription(description);
	log('Answer from remotePeerConnection: \n' + description.sdp);

	localPeerConnection.setRemoteDescription(description);
}

function gotRemoteStream (event){
	if (window.URL) {
		remoteVideo.src = window.URL.createObjectURL(event.stream);
	} else {
		remoteVideo.src = event.stream;
	}
	log("Received remote stream");
}

function gotLocalIceCandidate(event){
	if (event.candidate) {
		remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
		log("Local ICE candidate: \n" + event.candidate.candidate);
	}
}

function gotRemoteIceCandidate(event){
	if (event.candidate) {
		localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
		log("Remote ICE candidate: \n " + event.candidate.candidate);
	}
}

function hangup () {
	log('Ending call');
	localPeerConnection.close();
	remotePeerConnection.close();

	localPeerConnection = null;
	remotePeerConnection = null;

	hangupButton.disabled = true;
	callButton.disabled = false;
}





/*var vgaButton = document.querySelector("button#vga");
var qvgaButton = document.querySelector("button#qvga");
var hdButton = document.querySelector("button#hd");
var video = document.querySelector("video");
var stream;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function successCallback (gotStream) {
	console.log('gotStream: ', gotStream);
	window.stream = gotStream;
	video.src = window.URL.createObjectURL(stream);
	video.play();
}

function errorCallback(error){
  	console.log("navigator.getUserMedia error: ", error);
}

var qvgaConstraints = {
	video: {
		mandatory: {
			maxWidth: 320,
			maxHeight: 240
		}
	}
};

var vgaConstraints = {
	video: {
		mandatory: {
			maxWidth: 640,
			maxHeight: 480
		}
	}
};

var hdConstraints = {
	video: {
		mandatory: {
			maxWidth: 1280,
			maxHeight: 960
		}
	}
};

qvgaButton.onclick = function () { getMedia(qvgaConstraints) };
vgaButton.onclick = function () { getMedia(vgaConstraints) };
hdButton.onclick = function () { getMedia(hdConstraints) };

function getMedia (constraints) {
	// ketika klik awal stream bernilai false, ketika sudah klik tombol berikutnya stream bernilai true
	if(!!stream) {
		video.src = null;
		console.log('stream: ', stream);
		stream.stop();
	}
	navigator.getUserMedia(constraints, successCallback, errorCallback);	
}
*/


/*navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {audio: false, video: true};
var video = document.querySelector("video");
console.log('video: ', video);

function successCallback(stream) {
  	window.stream = stream; // stream available to console
  	console.log('stream: ', video);
  	console.log(stream);
  	if (window.URL) {
	    video.src = window.URL.createObjectURL(stream);
  	} else {
    	video.src = stream;
  	}
  	video.play();
}

function errorCallback(error){
  	console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);*/