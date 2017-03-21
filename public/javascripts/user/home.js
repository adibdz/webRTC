$(document).ready(function() {
	var soc_reveal = io.connect('/soc_reveal'),
	   	soc_chat = io.connect('/soc_chat');
  	var showModalChat = true;

	soc_reveal.on('connect', function () {
	   	var roomName = $('#namaRoom').val();
	   	soc_reveal.emit('join_room', {'name': roomName});
	   	var kdUser = $('#kdUser').val();
	   	var kdKelas = $('#kdKelas').val();
	   	var data = {
	   		roomName:roomName,
	   		kd_user:kdUser,
	   		kd_kelas:kdKelas
	   	};
	   	soc_reveal.emit('input_user', JSON.stringify(data));
	   	soc_reveal.emit('servUpdateStudent');
	   	soc_reveal.on('slidechanged', function (data) {
	        Reveal.slide(data.indexh, data.indexv, data.indexf);
	        console.log(data.indexh + ' ' + data.indexv + ' ' + data.indexf);
	    });
	    soc_reveal.on('userRedirect', function () {
			window.location.href = '/';
		});
		soc_reveal.on('disconnect', function () {
	        soc_reveal.disconnect();
	        console.log('soc_reveal disconnected');
	    });
	});

	soc_chat.on('connect', function () {
	   	var roomName = $('#namaRoom').val();
	   	soc_chat.emit('join_room', {'name': roomName, 'user': $('.brand').html()});
	    $('#inputMessage').keypress(function(event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13') {
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
			$('#messages').append('<div class="' + message.type + '">' + 
				'<span class="name">' + '<strong>' + message.user + '</strong>' + ": </span>" + 
				message.message + '</div>'
			);
			$('.modal-body').scrollTop(1000); // <<<-- BELUM BERES
			if(showModalChat) {
            	$('#noticeChat').fadeIn(1000);
          	}
		});
		soc_chat.on('otherDisconnect', function (data) {
			var dataMessage = JSON.parse(data);
			$('#messages').append('<div class="' + dataMessage.type + '">' + 
				'<span class="nameDisconnect">>> ' + dataMessage.namaUser + ' disconnected :(</span></div>'
			);
		});
		soc_chat.on('otherConnect', function (data) {
			var dataMessage = JSON.parse(data);
			$('#messages').append('<div class="' + dataMessage.type + '">' + 
				'<span class="nameConnect">>> ' + dataMessage.namaUser + ' connected :)</span></div>'
			);
		});
		soc_chat.on('disconnect', function () {
	        soc_chat.disconnect();
	        console.log('soc_chat disconnected');
	    });
	});
	$('#chat').click(function () {
		$('#modalChat').modal({
			show:true
		});
		showModalChat = false;
	});
	$('#closeChat').click(function () {
    	$('#noticeChat').fadeOut(1000);
  	});
  	$('#showChat').click(function () {
  		$('#modalChat').modal({
      		show:true
    	});
    	$('#noticeChat').fadeOut(1000);
    	showModalChat = false;
  	});
  	$('#modalChat').on('shown', function () {
    	showModalChat = false;
    	// alert('showModalChat: ' + showModalChat);
  	});
  	$('#modalChat').on('hidden', function () {
    	showModalChat = true;
    	// alert('showModalChat: ' + showModalChat);
  	});
});