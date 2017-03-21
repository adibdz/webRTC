var io = require('socket.io'),
	conn = require('./database'),
	easyrtc = require('easyrtc'),
	app = require('../app'),
	randomString = require('random-string');

module.exports = function (server) {
	io = io.listen(server);
	var rtc = easyrtc.listen(app, io);

	var soc_webrtc =  io.of('/soc_webrtc');
	soc_webrtc.on('connection', function (socket) {
		console.log('soc_webrtc connected | socket.id: ' + socket.id);
		socket.on('join_room', function(room) {
			console.log('soc_webrtc roomName: ' + room.name);

			socket.join(room.name);

			socket.on('disconnect', function () {
				socket.leave(room.name);
				socket.disconnect();
				console.log('soc_reveal socket.id: ' + socket.id + ' disconnected');
			});

			socket.on('lecCallStu', function (data) {
				socket.to(room.name).broadcast.emit('lecCallStu', data);
			});

			socket.on('stuCallLec', function (data) {
				socket.to(room.name).broadcast.emit('stuCallLec', data);
			});

			socket.on('stuWantCam', function (data) {
				socket.to(room.name).broadcast.emit('stuWantCam', data);
			});
		});
	});

	var soc_reveal =  io.of('/soc_reveal');
	soc_reveal.on('connection', function (socket) {
		console.log('soc_reveal connected | socket.id: ' + socket.id);
		socket.on('join_room', function(room) {
			console.log('soc_reveal roomName: ' + room.name);
			socket.join(room.name);
			socket.on('slidechanged', function (data) {
				socket.to(room.name).broadcast.emit('slidechanged', data);
				console.log('slidechanged: ' + data.indexh + ' ' + data.indexv + ' ' + data.indexf);
			});
			socket.on('ending', function () {
				socket.to(room.name).broadcast.emit('userRedirect');
			});
			socket.on('servUpdateStudent', function () {
				socket.to(room.name).broadcast.emit('addStudentList');
			});
			socket.on('disconnect', function () {
				socket.leave(room.name);
				socket.disconnect();
				console.log('soc_reveal socket.id: ' + socket.id + ' disconnected');
			});
		});
		socket.on('input_user', function (data) {
			var dataParse = JSON.parse(data);
			var randomKey = randomString({
		        length: 60,
		        numeric: true,
		        letters: true,
		        special: false
		    });
		    var id_user_sum = randomKey;
			var dataInput = {
				id: id_user_sum,
				kode_user_fk: dataParse.kd_user,
				kode_kelas_fk: dataParse.kd_kelas,
				nama_room_fk: dataParse.roomName
			};
			// id_user_sum = null;
			//console.log('dataInput: ', dataInput);
			user_input(dataInput);
		});
	});

	var soc_file =  io.of('/soc_file');
	soc_file.on('connection', function (socket) {
		console.log('soc_file connected | socket.id: ' + socket.id);
		socket.on('join_room', function(room) {
			// console.log('soc_file room.name: ' + room.name);
			// console.log('soc_file room.kdUser: ' + room.kdUser);
			socket.join(room.name);
			socket.on('imgChange', function (data) {
				socket.to(room.name).broadcast.emit('imgChangeStudent', {imgSrc:data.imgSrc});
			});
			socket.on('ending', function () {
				socket.to(room.name).broadcast.emit('userRedirect');
			});
			socket.on('servUpdateStudent', function (data) {
				socket.to(room.name).broadcast.emit('addStudentList', data);
			});
			socket.on('disconnect', function () {
				socket.to(room.name).broadcast.emit('studentDisconnect', {kdUser: room.kdUser});
				// console.log('soc_file disconnect room.kdUser: ' + room.kdUser);
				hapusAbsensi(room.kdUser, room.name);
				socket.leave(room.name);
				socket.disconnect();
				console.log('soc_file socket.id: ' + socket.id + ' disconnected');
			});
		});
		socket.on('input_user', function (data) {
			var dataParse = JSON.parse(data);
			var randomKey = randomString({
		        length: 60,
		        numeric: true,
		        letters: true,
		        special: false
		    });
		    var id_user_sum = randomKey;
			var dataInput = {
				id: id_user_sum,
				kode_user_fk: dataParse.kd_user,
				kode_kelas_fk: dataParse.kd_kelas,
				nama_room_fk: dataParse.roomName,
				statusOnline: 'on'
			};
			user_input(dataInput);
		});
	});

	function user_input (dataInput) {
		setImmediate(function () {
			conn.query('SELECT count(id) as jum FROM user_sum WHERE kode_user_fk = ? AND nama_room_fk = ?', 
				[dataInput.kode_user_fk, dataInput.nama_room_fk],
				function (err, rows) {
					if(err) {
						return console.log('query select user error: ' + err);
					}
					if(rows[0].jum > 0) {
						console.log('USER SUDAH ABSESNSI');
						updateAbsensi(dataInput.kode_user_fk, dataInput.nama_room_fk);
					} else {
						userAbsensi(dataInput);
					}
			});
		});
	}
	function userAbsensi (dataInput) {
		setImmediate(function () {
			conn.query('INSERT INTO user_sum SET ?', dataInput, function (err, rows) {
				if(err) {
					return console.log('query user input error: ' + err);
				}
				return console.log('USER ABSENSI, statusOnline on: ' + rows.affectedRows);
			});
		});
	}
	function updateAbsensi (kdUser, nama_room_fk) {
		setImmediate(function () {
			conn.query('UPDATE user_sum SET statusOnline = ? WHERE kode_user_fk = ? AND nama_room_fk = ?', ['on', kdUser, nama_room_fk], function (err, rows) {
				if(err) {
					return console.log('query user delete error: ' + err);
				}
				return console.log('statusOnline on: ' + rows.affectedRows);
			});
		});
	}
	function hapusAbsensi (kdUser, nama_room_fk) {
		console.log('hapusAbsensi kdUser: ' + kdUser);
		setImmediate(function () {
			conn.query('UPDATE user_sum SET statusOnline = ? WHERE kode_user_fk = ? AND nama_room_fk = ?', ['off', kdUser, nama_room_fk], function (err, rows) {
				if(err) {
					return console.log('query user delete error: ' + err);
				}
				return console.log('statusOnline off: ' + rows.affectedRows);
			});
		});
	}

	var soc_chat = io.of('/soc_chat');
	soc_chat.on('connection', function (socket) {
		console.log('soc_chat connected | socket.id: ' + socket.id);
		socket.on('join_room', function (room) {
			console.log('soc_chat roomName: ' + room.name);
			socket.join(room.name);
			var namaUser = room.user;
			var data = {
				namaUser: namaUser,
				type: 'userConnect'
			};
			socket.to(room.name).broadcast.emit('otherConnect', JSON.stringify(data));
			socket.on('message', function (message) {
				var message = JSON.parse(message);
				namaUser = message.user;
				// console.log('message: ' + JSON.stringify(message));
				socket.to(room.name).broadcast.send(JSON.stringify(message));
				message.type = 'myMessage';
				// console.log('message2: ' + JSON.stringify(message));
				socket.send(JSON.stringify(message));
				
				var now = new Date();
				var hours = now.getHours(),
					minutes = (now.getMinutes()+1),
					seconds = now.getSeconds();
				var randomKey = randomString({
			        length: 60,
			        numeric: true,
			        letters: true,
			        special: false
			    });
				var data = {
					id_message: randomKey,
					date: now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate(),
					time: hours + ':' + minutes + ':' + seconds,
					message: message.message,
					kode_user_fk: message.kdUser,
					nama_room_fk: room.name
				};
				// console.log(data);
				setImmediate(function () {
					conn.query('INSERT INTO chat_message SET ?', data, function (err, rows) {
						if(err) {
							return console.log('query error: ' + err);
						}
						// console.log(JSON.stringify(rows));
						return console.log('Insert message status: ' + rows.affectedRows);
					});
				});
			});
			socket.on('disconnect', function () {
				var data = {
					namaUser: namaUser,
					type: 'userDisconnect'
				};
				socket.to(room.name).broadcast.emit('otherDisconnect', JSON.stringify(data));
				socket.leave(room.name);
				socket.disconnect();
				console.log('soc_chat socket.id: ' + socket.id + ' disconnected');
			});
		});
	});

	var soc_publish = io.of('/soc_publish');
	soc_publish.on('connection', function (socket) {
		console.log('soc_publish connected | socket.id: ' + socket.id);
		socket.on('join_room', function(room) {
			socket.join(room.name);
			console.log(room.level + ' ' + socket.id + ' has joinned ' + room.name);
			if(room.level == 'dosen') {
				socket.to(room.name).broadcast.emit('studentRefresh');
			}
			socket.on('disconnect', function () {
				socket.leave(room.name);
				socket.disconnect();
				console.log(room.level + ' soc_publish ' + socket.id + ' disconnected');
			});
		});
	});
	
	var soc_canvas = io.of('/soc_canvas');
	soc_canvas.on('connection', function (socket) {
		console.log('soc_canvas connected | socket.id: ' + socket.id);
		socket.on('join_room', function (room) {
			socket.join(room.name);
			socket.on('mouseDown', function (data) {
				socket.to(room.name).broadcast.emit('mouseDownOthers', data);
			});
			socket.on('drawLine', function (data) {
				socket.to(room.name).broadcast.emit('drawLineOthers', data);
			});
			socket.on('mouseUp', function (data) {
				socket.to(room.name).broadcast.emit('mouseUpOthers', data);
			});
			socket.on('clearCanvas', function () {
				socket.to(room.name).broadcast.emit('clearCanvasOthers');
			})
		});
	});

	// var soc_canvas2 = io.of('/soc_canvas2');
	// soc_canvas2.on('connection', function (socket) {
	// 	socket.on('mouseDown', function (data) {
	// 		socket.broadcast.emit('mouseDownOthers', data);
	// 	});
	// 	socket.on('drawLine', function (data) {
	// 		socket.broadcast.emit('drawLineOthers', data);
	// 	});
	// 	socket.on('mouseUp', function (data) {
	// 		socket.broadcast.emit('mouseUpOthers', data);
	// 	});
	// });

	
};