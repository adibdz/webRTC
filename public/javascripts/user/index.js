$(document).ready(function () {
	var soc_publish = io.connect('/soc_publish');
	soc_publish.on('connect', function () {
		soc_publish.emit('join_room', {'name': 'defaultRoom', 'level': 'user'});
		soc_publish.on('studentRefresh', function () {
			window.location.href = '/';
		});
		$('#enroll').click(function () {
			var rn = $('#rn').val();
			var al = $('#al').val();
			var enrVal = $('#enrollVal').val();
			// alert('enrVal: ' + enrVal);
			window.location.href = '/livePres?rn=' + rn + '&al=' + al + '&ev=' + enrVal;
		});
		$('#logout').click(function () {
			window.location.href = '/logout';
		});
		soc_publish.on('disconnect', function () {
		    soc_publish.disconnect();
		    console.log('soc_publish disconnected');
		});
	});
});