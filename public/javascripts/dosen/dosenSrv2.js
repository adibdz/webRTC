$(document).ready(function () {
    $('#navRev').attr('class', 'active');
	var soc_reveal = io.connect('/soc_reveal'),
		  soc_chat = io.connect('/soc_chat');
    var showModalChat = true;

	soc_reveal.on('connect', function () {
    	var roomName = $('#namaRoom').val();
    	soc_reveal.emit('join_room', {'name': roomName});

	    Reveal.initialize({
	      	history: true
	    });
	    notifyServer = function (event) {
	        var data = {
	            indexv : Reveal.getIndices().v,
	            indexh : Reveal.getIndices().h,
	            indexf : Reveal.getIndices().f || 0
	        };
	        soc_reveal.emit("slidechanged" , data);
	        console.log(data.indexh + ' ' + data.indexv + ' ' + data.indexf);
	    };
	    Reveal.addEventListener("slidechanged", notifyServer);
	    Reveal.addEventListener("fragmentshown", notifyServer);
	    Reveal.addEventListener("fragmenthidden", notifyServer);

  		$('#delPres').click(function () {
  			$.getJSON('/dosen/ajax/endPres', {rn:roomName, type:'rev'}, function (response) {
  				if(response.status == true) {
  					soc_reveal.emit('ending');
  					window.location.href = '/dosen';
  				} else {
  					alert('Error: ' + response.err);
  				}
  			});
  		});
    soc_reveal.on('addStudentList', function () {
        var roomName = $('#namaRoom').val();
        var namaKelas = $('#namaKelas').val();
        $.getJSON('/dosen/ajax/updateUserOnline', {rn:roomName}, function (response) {
            if(response.status == 0) {
                console.log('Error updating list: ' , response.error);
            } else {
                $('#totalStudent').html(response.total);
                var data = response.data;
                // console.log('data: ', data);
                var isi = '';
                
                for (var i = 0; i < data.length; i++) {
                    isi = isi + '<tr>' +
                        '<td>'+ data[i].kode_user +'</td>' +
                        '<td>'+ data[i].nama_user +'</td>' +
                    '</tr>';
                }
                // console.log('isi: ', isi);
                $('#studentList').html(isi);
            }
        });
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
          '<span class="nameDisconnect">>> ' + dataMessage.namaUser + ' disconnect :(</span></div>'
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
  $('#student').click(function () {
    var roomName = $('#namaRoom').val();
    var namaKelas = $('#namaKelas').val();
    $('#modalList').load('/dosen/ajax/loadUserOnline?rn='+roomName+'&kl='+namaKelas+'&typeReq=button');
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