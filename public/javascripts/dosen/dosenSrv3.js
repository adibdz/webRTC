$(document).ready(function () {
	$('#navHome').attr('class', '');
	$('#navDrop').attr('class', 'dropdown');
	$('#navFile').attr('class',  'active');
	// $('#navLive').attr('class', '');
	$('#navFileUp').attr('class', '');
	$('#navRev').attr('class', '');
	var soc_file = io.connect('/soc_file'),
		soc_chat = io.connect('/soc_chat');
	var roomName = $('#namaRoom').val();
	var jumChat = 0;

	function runCanvasBackground (path) {
		$('#myCanvas').css('background-image', path);
	}
	var pathFile = 'url(' + $('#_pathFile').val() + ')';
	runCanvasBackground(pathFile);

	function getUserOnline () {
		$.ajax({
			type: 'GET',
			url: '/dosen/ajax/loadUserOnline',
			// data: 'rn=' + $('#namaRoom').val() + '&kl=' + $('#namaKelas').val() + '&typeReq=refresh',
			data: 'rn=' + $('#namaRoom').val() + '&typeReq=refresh',
			dataType: 'json',
			beforeSend: function () {
				$('.statusOnline').html('waiting ...');
			},
			success: function (response) {
				if(response.status == true) {
					for (var i = 0; i < response.data.length; i++) {
						if(response.data[i].statusOnline == 'on') {
							$('#' + response.data[i].kode_user).html('<span class="label label-success">online</span>');		
						} else {
							$('#' + response.data[i].kode_user).html('<span class="label label-important">offline</span>');
						}
					}
				} else {
					alert('server error: ' + response.eror);
				}
			}
		})
		return false;
	}
	getUserOnline();

	soc_file.on('connect', function () {
		// var roomName = $('#namaRoom').val();
		var kdUser = $('#kdUser').val();
		soc_file.emit('join_room', {name: roomName, kdUser: kdUser});
		
		var page = 0,
			btn = '';
		$('#btnNext').click(function () {
			btn = 'next';
			page++;
			getSlide(btn);
		});
		$('#btnPrev').click(function () {
			btn = 'prev';
			page--;
			getSlide(btn);
		});
		$('#btnFirst').click(function () {
			page = 0;
			btn = 'first';
			getSlide(btn);
		});
		$('#btnLast').click(function () {
			page = $('#maxPage').html() - 1;
			btn = 'last';
			getSlide(btn);
		});

		function getSlide (cekBtn) {
			var counter = 0;
			if(cekBtn == 'next') {
				counter = page + 1;
				console.log('+ page: ' + page + ' | counter: ' + counter);
			} else if(cekBtn == 'prev') {
				counter = page + 1;
				console.log('- page: ' + page + ' | counter: ' + counter);
			} else if(cekBtn == 'first') {
				counter = page + 1;
				console.log('+ page: ' + page + ' | counter: ' + counter);
			} else {
				// btn = last
				counter = page + 1;
				console.log('- page: ' + page + ' | counter: ' + counter);
			}
			$.getJSON('/dosen/ajax/getImageNext', {rn:roomName, kdUser:kdUser, page: page}, function (response) {
				if(response.status == true) {
					$('#pageCounter').html(counter);
					var _url = 'url(' + response.data + ')';
					$('#myCanvas').css('background-image', _url);
					// $('#imagePdf').attr("src", response.data);
					soc_file.emit('imgChange', {imgSrc: response.data});
				} else if(response.status == 'end') {
					$('#pageCounter').html(1);
					var _url = 'url(' + response.data + ')';
					$('#myCanvas').css('background-image', _url);
					// $('#imagePdf').attr("src", response.data);
					soc_file.emit('imgChange', {imgSrc: response.data});
					page = 0;
				} else {
					alert('Error: ' + response.err);
				}
			});
		}

		$('#delPres').click(function () {
			$.getJSON('/dosen/ajax/endPres', {rn:roomName, type:'file'}, function (response) {
				if(response.status == true) {
					soc_file.emit('ending');
					window.location.href = '/dosen';
				} else {
					alert('Error: ' + response.err);
				}
			});
		});

		soc_file.on('addStudentList', function (dataKdUser) {
			// var roomName = $('#namaRoom').val();
			var namaKelas = $('#namaKelas').val();
			$.getJSON('/dosen/ajax/updateUserOnline', {rn:roomName}, function (response) {
				if(response.status == false) {
					console.log('Error updating list: ' , response.error);
				} else {
					$('#totalStudent').html(response.total);
					var data = response.data;
					var isi = '';
					for (var i = 0; i < data.length; i++) {
						isi = isi + '<tr>' +
							  '<td>'+ data[i].kode_user +'</td>' +
							  '<td>'+ data[i].nama_user +'</td>' +
							  '</tr>';
						if(data[i].statusOnline == 'on') {
							$('#' + data[i].kode_user).html('<span class="label label-success">online</span>');		
						} else {
							$('#' + data[i].kode_user).html('<span class="label label-important">offline</span>');
						}
						// $('#' + data[i].kode_user).html('<span class="label label-success">online</span>');	
					}
					$('#studentList').html(isi);
				}
			});
		});

		soc_file.on('studentDisconnect', function (data) {
			$('#' + data.kdUser).html('<span class="label label-important">offline</span>');	
		});

		soc_file.on('disconnect', function () {
			soc_file.disconnect();
			console.log('soc_file disconnected');
		});
	});

	soc_chat.on('connect', function () {
		soc_chat.emit('join_room', {'name': roomName, 'user': $('.brand').html()});
		
		$('#inputMessage').keypress(function  (event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13') {
				if($(this).val() == '') {
					return false;
				}
				var data = {
					message: $(this).val(),
					type: 'userMessage',
					user: $('.brand').html(),
					kdUser: $('#kdUser').val()
				};
				soc_chat.send(JSON.stringify(data));
				$(this).val('');
			}
		});
		
		soc_chat.on('message', function (message) {
			var message = JSON.parse(message);
			jumChat++;
			$('.badge').html(jumChat).show();
			if(message.type == 'myMessage') {	
				$('.messages ul').append(
					'<li><span class="left">' + message.message + '</span>' +
					'<div class="clear"></div></li>'
					);
				var messageDiv=$('.messages');
				messageDiv.scrollTop(messageDiv[0].scrollHeight);
			} else{
				$('.messages ul').append(
					'<li><span class="right">' + '<strong>' + message.user + '</strong><br>' + 
					message.message + '</span>' +
					'<div class="clear"></div></li>'
					);
				var messageDiv=$('.messages');
				messageDiv.scrollTop(messageDiv[0].scrollHeight);
			}
		});

		soc_chat.on('disconnect', function () {
			soc_chat.disconnect();
			console.log('soc_chat disconnected');
		});
	});

	$('.popup-beforeClick').click(function () {
		$(this).hide();
		$('.popup-box').show();
	});

	$('.popup-head').click(function () {
		$('.popup-box').hide();
		$('.popup-beforeClick').show();
		$('.badge').hide();
		jumChat = 0;
	});

	$('#student').click(function () {
		// var roomName = $('#namaRoom').val();
		var namaKelas = $('#namaKelas').val();
		$('#modalList').load('/dosen/ajax/loadUserOnline?rn='+roomName+'&kl='+namaKelas+'&typeReq=button');
	});
});