$(document).ready(function() {
	var soc_file = io.connect('/soc_file'),
	   	soc_chat = io.connect('/soc_chat');
	var jumChat = 0;

  	function getUserOnline () {
		$.ajax({
			type: 'GET',
			url: '/loadUserOnline',
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

  	function runCanvasBackground (path) {
		$('#myCanvasClient').css('background-image', path);
	}
	var pathFile = 'url(' + $('#_pathFile').val() + ')';
	runCanvasBackground(pathFile);

	soc_file.on('connect', function () {
	   	var roomName = $('#namaRoom').val();
	   	var kdUser = $('#kdUser').val();
	   	soc_file.emit('join_room', {name: roomName, kdUser: kdUser});
	   	var kdUser = $('#kdUser').val();
	   	var kdKelas = $('#kdKelas').val();
	   	var data = {
	   		roomName:roomName,
	   		kd_user:kdUser,
	   		kd_kelas:kdKelas
	   	};
	   	soc_file.emit('input_user', JSON.stringify(data));
	   	soc_file.emit('servUpdateStudent', {kdUser: kdUser});
	   	soc_file.on('imgChangeStudent', function (data) {
	   		// console.log('src: ' + data.imgSrc);
	        // $('#imagePdf').attr('src', data.imgSrc);
	        var _url = 'url(' + data.imgSrc + ')';
			$('#myCanvasClient').css('background-image', _url);
	    });
	    soc_file.on('studentDisconnect', function (data) {
			$('#' + data.kdUser).html('<span class="label label-important">offline</span>');	
		});
		soc_file.on('addStudentList', function (data) {
			$('#' + data.kdUser).html('<span class="label label-success">online</span>');	
		});
	    soc_file.on('userRedirect', function () {
			window.location.href = '/';
		});
		soc_file.on('disconnect', function () {
	        soc_file.disconnect();
	        console.log('soc_file disconnected');
	    });
	});

	soc_chat.on('connect', function () {
	   	var roomName = $('#namaRoom').val();
	   	soc_chat.emit('join_room', {name: roomName, user: $('.brand').html()});
	    $('#inputMessage').keypress(function(event) {
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
});