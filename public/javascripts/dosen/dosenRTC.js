$(document).ready(function () {
	// $('#disconnect').hide();
	var roomRTCName = $('#kdUser').val();
	console.log('roomRTCName: ' + roomRTCName);

	var idPeerLec;
	var soc_webrtc = io.connect('/soc_webrtc');
	
	soc_webrtc.emit('join_room', {name:$('#namaRoom').val()});

	easyrtc.setDisconnectListener( function() {
		console.log("LOST-CONNECTION. Automatic refresh page and call again your students.");
		alert('LOST-CONNECTION. Automatic refresh page and call again your students.');
		// window.location.href = '/dosen/livePresFile';
		location.reload();
        // easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
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

	$('#callStudents').click(function () {
		console.log('initiating camera+audio on #callStudents.click().');
		// easyrtc.enableAudio(false);
		// easyrtc.enableAudioReceive(false);
		easyrtc.initMediaSource(
			function (mediaStreams) {
				// console.log('call students. #lecturerVideo: ' + $('#lecturerVideo').attr('src'));
				// if($('#lecturerVideo').attr('src') == '') {
				// 	console.log('#lecturerVideo: empty');
				// 	easyrtc.setVideoObjectSrc( document.getElementById('lecturerVideo'), mediaStreams);
				// } else {
				// 	console.log('#lecturerVideo: filled');
				// }
				console.log('live cam lec on #callStudents.click()');
				easyrtc.setVideoObjectSrc( document.getElementById('lecturerVideo'), mediaStreams);
				soc_webrtc.emit('lecCallStu', {idPeerLec: idPeerLec});
				$('#callStudents').hide();
				$('#disconnect').show();
			},
			function (ec, et) {
				$('#errorText').html(ec + ': ' + et);
				$('#notice').show();
				// easyrtc.showError(ec, et);
			});
	});

	$('#disconnect').click(function () {
		console.log('disconnectting');
		easyrtc.hangupAll();
		// easyrtc.disconnect();
		easyrtc.setVideoObjectSrc( document.getElementById('lecturerVideo'), '');
		easyrtc.setVideoObjectSrc( document.getElementsByClassName('studentVid'), '');
		$('#disconnect').hide();
		$('#callStudents').show();
	});

	function easyrtcCall (data) {
		console.log('initiating camera+audio on easyrtcCall().');
		if($('#lecturerVideo').attr('src') == '') {
			console.log('#lecturerVideo: empty');
			console.log('live cam lec on easyrtcCall()');
			easyrtc.setVideoObjectSrc( document.getElementById('lecturerVideo'), easyrtc.getLocalStream());
			// perlu tambahi disable tombol callStudent dan enable tombol disconnect ?
			// bug ada di ketika dosen sudah live webrtc lalu klik disconnect, lalu ada mhs yg connect
			// maka kamera dosen akan aktif otomatis, tombol disconnect tidak muncul
			// javascript turn off camera and microphone ?

			/*$('#callStudents').hide();
				$('#disconnect').show();*/
		} else {
			console.log('#lecturerVideo: filled');
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

	
	easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
		console.log('setStreamAcceptor from student: ' + easyrtcid);
		var idUsrVid = easyrtc.idToName(easyrtcid) + easyrtc.idToName(easyrtcid);
		var studentVideo = document.getElementById(idUsrVid);
    	easyrtc.setVideoObjectSrc(studentVideo, stream);
    	easyrtc.setVideoObjectSrc( document.getElementById('lecturerVideo'), easyrtc.getLocalStream());
	});

	easyrtc.setOnStreamClosed( function (easyrtcid) {
		console.log('student disconnect. ' + easyrtcid + ' --->> ' + easyrtc.idToName(easyrtcid));
	    // easyrtc.setVideoObjectSrc(document.getElementById(id objek dom-nya client yg disconnect), '');
	    // kalau ada client yg disconnect, gambar video di lec akan freeze.
	});

	soc_webrtc.on('stuWantCam', function (data) {
		console.log('calling again student: ' + data.idPeerStu + ' > ' + easyrtc.idToName(data.idPeerStu));
		easyrtcCall(data);
	});

	$('#btnOk').click(function () {
		$('#notice').hide();
	});
});