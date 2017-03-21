$(document).ready(function() {
	$('#navRTC').attr('class', 'active');
	$('#navHome').attr('class', '');
	$('#navUser').attr('class', '');
	$('#navKelas').attr('class', '');

	var localStream, localPeerConnection, remotePeerConnection;

	var localVideo = document.getElementById("localVideo");
	var remoteVideo = document.getElementById("remoteVideo");

	var startButton = document.getElementById("startButton");
	var callButton = document.getElementById("callButton");
	var hangupButton = document.getElementById("hangupButton");

	startButton.disabled = false;
	callButton.disabled = true;
	hangupButton.disabled = true;
	startButton.onclick = start;
	callButton.onclick = call;
	hangupButton.onclick = hangup;

	function trace(text) {
	  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
	}

	function gotStream(stream){
	  trace("Received local stream");
	  localVideo.src = URL.createObjectURL(stream);
	  localStream = stream;
	  callButton.disabled = false;
	}

	function start() {
	  trace("Requesting local stream");
	  startButton.disabled = true;
	  getUserMedia({audio:true, video:true}, gotStream,
	    function(error) {
	      trace("getUserMedia error: ", error);
	    });
	}

	function call() {
	  callButton.disabled = true;
	  hangupButton.disabled = false;
	  trace("Starting call");

	  if (localStream.getVideoTracks().length > 0) {
	    trace('Using video device: ' + localStream.getVideoTracks()[0].label);
	  }
	  if (localStream.getAudioTracks().length > 0) {
	    trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
	  }

	  var servers = null;
	  /*var serversICE = {
		  'iceServers': [
		    {
		      'url': 'stun:stun.l.google.com:19302'
		    },
		    {
		      'url': 'turn:192.158.29.39:3478?transport=udp',
		      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		      'username': '28224511:1379330808'
		    },
		    {
		      'url': 'turn:192.158.29.39:3478?transport=tcp',
		      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		      'username': '28224511:1379330808'
		    }
		  ]
		};*/

	  localPeerConnection = new RTCPeerConnection(servers);
	  trace("Created local peer connection object localPeerConnection");
	  localPeerConnection.onicecandidate = gotLocalIceCandidate;

	  remotePeerConnection = new RTCPeerConnection(servers);
	  trace("Created remote peer connection object remotePeerConnection");
	  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	  
	  remotePeerConnection.onaddstream = gotRemoteStream;

	  localPeerConnection.addStream(localStream);
	  trace("Added localStream to localPeerConnection");
	  localPeerConnection.createOffer(gotLocalDescription,handleError);
	}

	function gotLocalDescription(description){
	  localPeerConnection.setLocalDescription(description);
	  trace("Offer from localPeerConnection: \n" + description.sdp);
	  remotePeerConnection.setRemoteDescription(description);
	  remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
	}

	function gotRemoteDescription(description){
	  remotePeerConnection.setLocalDescription(description);
	  trace("Answer from remotePeerConnection: \n" + description.sdp);
	  localPeerConnection.setRemoteDescription(description);
	}

	function gotRemoteStream(event){
	  remoteVideo.src = URL.createObjectURL(event.stream);
	  trace("Received remote stream");
	}

	function gotLocalIceCandidate(event){
	  if (event.candidate) {
	    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    trace("Local ICE candidate: \n" + event.candidate.candidate);
	  }
	}

	function gotRemoteIceCandidate(event){
	  if (event.candidate) {
	    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    trace("Remote ICE candidate: \n " + event.candidate.candidate);
	  }
	}

	function hangup() {
	  trace("Ending call");
	  localPeerConnection.close();
	  remotePeerConnection.close();
	  localPeerConnection = null;
	  remotePeerConnection = null;
	  hangupButton.disabled = true;
	  callButton.disabled = false;
	}

	function handleError(){}
});