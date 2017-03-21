$(document).ready(function () {
	var roomRTCName = $('#kdUser').val();
	console.log('roomRTCName: ' + roomRTCName);

	var idPeerLec;
	var soc_webrtc = io.connect('/soc_webrtc');
	
	soc_webrtc.emit('join_room', {name:$('#namaRoom').val()});

	easyrtc.setDisconnectListener( function() {
		console.log("LOST-CONNECTION. Automatic refresh page and call again your students.");
		alert('LOST-CONNECTION. Automatic refresh page and call again your students.');
		location.reload();
    });
	easyrtc.setUsername($('.brand').html());

	easyrtc.connect(roomRTCName,
		function (easyrtcid, roomOwner) {
			console.log('connecting peer.');
			idPeerLec = easyrtcid;
			console.log('lecturer: ' + easyrtcid + ' > ' + easyrtc.idToName(easyrtcid));
		},
		function (ec, et) {
			console.log('error connecting.: ' + et);
			$('#errorText').html(ec + ': ' + et);
			$('#notice').show();
			// easyrtc.showError(et);
		});

	$('#audioRev').click(function () {
		console.log('initiating audio on #audioRev.click().');
		easyrtc.enableVideo(false);
		easyrtc.enableVideoReceive(false);
		easyrtc.enableAudio(true);
		easyrtc.enableAudioReceive(false);
		easyrtc.initMediaSource(
			function (mediaStreams) {
				console.log('live audio lec on #audioRev.click()');
				easyrtc.setVideoObjectSrc( document.getElementById('lecturerAudio'), mediaStreams);
				soc_webrtc.emit('lecCallStu', {idPeerLec: idPeerLec});
				$('#audioRev').hide();
				$('#audioRevDis').show();
			},
			function (ec, et) {
				$('#errorText').html(ec + ': ' + et);
				$('#notice').show();
				// easyrtc.showError(ec, et);
			});
	});

	$('#audioRevDis').click(function () {
		console.log('audioRevDisting');
		easyrtc.hangupAll();
		easyrtc.setVideoObjectSrc( document.getElementById('lecturerAudio'), '');
		$('#audioRevDis').hide();
		$('#audioRev').show();
	});

	function easyrtcCall (data) {
		console.log('initiating camera+audio on easyrtcCall().');
		if($('#lecturerAudio').attr('src') == '') {
			console.log('#lecturerAudio: empty');
			console.log('live audio lec on easyrtcCall()');
			easyrtc.setVideoObjectSrc( document.getElementById('lecturerAudio'), easyrtc.getLocalStream());
		} else {
			console.log('#lecturerAudio: filled');
		}
		easyrtc.call(data.idPeerStu,
			function (easyrtcid, mediaType) {
				console.log("Respon Student mediaType " + mediaType + " from " + easyrtc.idToName(easyrtcid));
			},
			function (ec, et) {
				$('#errorText').html(ec + ': ' + et);
				$('#notice').show();
				// easyrtc.showError(ec, et);
			},
			function (wasAccepted, easyrtcid) {
				if( !wasAccepted ) {
					console.log('CALL-REJECTED, Sorry, your call to ' + easyrtc.idToName(easyrtcid) + 
						'was rejected');
					// easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + 
						// easyrtc.idToName(easyrtcid) + " was rejected");
        		} else {
        			console.log('Call Accepted by student: ' + easyrtcid + ' ' + easyrtc.idToName(easyrtcid));
        		}
			});
	}

	soc_webrtc.on('stuCallLec', function (data) {
		console.log('id peer student received: ' + data.idPeerStu + ' > ' + easyrtc.idToName(data.idPeerStu));
		easyrtcCall(data);
	});

	soc_webrtc.on('stuWantCam', function (data) {
		console.log('calling again student: ' + data.idPeerStu + ' > ' + easyrtc.idToName(data.idPeerStu));
		easyrtcCall(data);
	});

	$('#btnOk').click(function () {
		$('#notice').hide();
	});
});