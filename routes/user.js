var express = require('express'),
	passport = require('passport'),
	conn = require('../config/database.js'),
	S = require('string'),
	router = express.Router();

router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('/home');
	}
	res.render('user/login', { title: 'Final Project' });
});

router.post('/login', passport.authenticate('local-login-user', {
	successRedirect : '/home',
	failureRedirect : '/'
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if(req.user.level == 'User') {
			console.log('4_userRoute: ' + JSON.stringify(req.user));
			return next();
		}
	}
	res.redirect('/');
}

router.get('/home', isLoggedIn, function(req, res) {
	var kdKelas = req.user.kode_kelas_fk;
	var angkatan = req.user.tahun_angkatan;
	console.log('kdKelas: ', kdKelas);
	console.log('angkatan: ', angkatan);
	setImmediate(function () {
		conn.query('SELECT id_file_fk FROM socket_room WHERE kode_kelas_fk = ? AND angkatan = ?', [kdKelas, angkatan], function (err, rows) {
			if(err) {
				console.log('query error: ' + err);
			}
			console.log('rows: ', rows);
			if(rows == '') {
				return res.render('user/index', {
					title: 'Dzulfikar Final Project', 
					user: req.user,
					status: false,
					cekPresent: 'default'
				});
			} else {
				if(rows[0].id_file_fk == null) {
					revealPresent();
				} else {
					filePresent();
				}
			}
		});
	});
	function revealPresent () {
		setImmediate(function () {
			var kdKelas = req.user.kode_kelas_fk;
			var querys = 'SELECT socket_room.nama_room, kelas.nama_kelas, user.nama_user, slide.kode_matkul_slide as kode_matkul, ' +
						'slide.nama_matkul_slide as nama_matkul, slide.chapter, socket_room.nama_room_alias ' +
						'FROM socket_room LEFT JOIN kelas ON socket_room.kode_kelas_fk = kelas.kode_kelas ' +
						'LEFT JOIN user ON socket_room.kode_user_fk = user.kode_user ' +
						'LEFT JOIN slide ON socket_room.id_present_fk = slide.id_present ' +
						'WHERE kelas.kode_kelas = ? AND angkatan = ?';
			conn.query(querys, [kdKelas,angkatan], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.render('user/index', {
					data: rows,
					title: 'Dzulfikar Final Project', 
					user: req.user,
					status: false,
					cekPresent: 'reveal',
				});
			});
		});
	}
	function filePresent () {
		setImmediate(function () {
			var kdKelas = req.user.kode_kelas_fk;
			var querys = 'SELECT socket_room.nama_room, kelas.nama_kelas, user.nama_user, file.kode_matkul_present as kode_matkul, ' +
						'file.nama_matkul_present as nama_matkul, file.chapter, socket_room.nama_room_alias ' +
						'FROM socket_room LEFT JOIN kelas ON socket_room.kode_kelas_fk = kelas.kode_kelas ' +
						'LEFT JOIN user ON socket_room.kode_user_fk = user.kode_user ' +
						'LEFT JOIN file ON socket_room.id_file_fk = file.id_file ' +
						'WHERE kelas.kode_kelas = ? AND angkatan = ?';
			conn.query(querys, [kdKelas,angkatan], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.render('user/index', {
					data: rows,
					title: 'Dzulfikar Final Project', 
					user: req.user,
					status: false,
					cekPresent: 'file'
				});
			});
		});
	}	
});

router.get('/livePres', isLoggedIn, function (req, res) {
	// setImmediate(function () {
		var roomId = (req.query.rn) ? req.query.rn : 'rooms';
		var roomNameAlias = (req.query.al) ? req.query.al : 'roomsAlias';
		var enrollVal = (req.query.ev) ? req.query.ev : 'nonePresent';
		var kdKelas = req.user.kode_kelas_fk;
		var kdUser = req.user.kode_user;
		/*TAMBAHI CEK ANGAKTAN DI SINI UNTUK FILTER MASUK DARI URL SECARA LANGSUNG*/ 
		setImmediate(function () {
			conn.query('SELECT angkatan FROM socket_room WHERE nama_room = ?', roomId, function (err, rows) {
				if(err) {
					return false;
				} else {
					// console.log('rows: ', rows);
					// console.log('rows: ', rows[0]);
					if(rows == '') {
						return res.redirect('/home');
					} else {
						cekAngkatanUser(rows[0].angkatan);
					}
					// cekAngkatanUser(rows[0].angkatan);
				}
			});
		});
		function cekAngkatanUser(angkatanRoom) {
			conn.query('SELECT user.tahun_angkatan FROM user WHERE user.kode_user = ?', kdUser, function (err, rows) {
				if(err) {
					return false;
				} else {
					var angkatanUser = rows[0].tahun_angkatan;
					console.log('angkatanRoom: ' + angkatanRoom + '| angkatanUser: ' + angkatanUser);
					if ((enrollVal == 'reveal') && (angkatanRoom == angkatanUser)) {
						getLiveReveal(roomId, roomNameAlias, kdKelas);
					} else if ((enrollVal == 'file') && (angkatanRoom == angkatanUser)) {
						getLiveFile(roomId, roomNameAlias, kdKelas, angkatanRoom);
					} else {
						res.redirect('/home');
					}
				}
			});
		}
		/*---*/
		// if (enrollVal == 'reveal') {
		// 	getLiveReveal(roomId, roomNameAlias, kdKelas);
		// } else if (enrollVal == 'file') {
		// 	getLiveFile(roomId, roomNameAlias, kdKelas);
		// } else {
		// 	res.redirect('/');
		// }
	// });
	function getLiveReveal (roomId, roomNameAlias, kdKelas) {
		var querys = 'SELECT sections.judul_isi, sections.isi_section, sections.data_transition, sections.data_background, ' +
					'slide.kode_user_fk FROM sections ' +
					'RIGHT JOIN slide ON sections.id_present_fk = slide.id_present ' +
					'RIGHT JOIN socket_room ON slide.id_present = socket_room.id_present_fk ' +
					'WHERE socket_room.nama_room = ? AND socket_room.kode_kelas_fk = ? ' +
					'ORDER BY sections.no_section ';
		setImmediate(function () {
			conn.query(querys, [roomId, kdKelas], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.send('No Presentasion Created.');
				}
				if(rows == '') {
					//return res.send('No Presentasion Created.');
					return res.redirect('/');
				} else {
					return res.render('user/livePresReveal', {
						data: rows,
						user: req.user,
						roomName: roomNameAlias,
						roomId: roomId,
						status: true,
						kdKelas: kdKelas,
						kdDosen: rows[0].kode_user_fk,
						type: 'rev'
					});
				}
			});
		});
	}
	function getLiveFile (roomId, roomNameAlias, kdKelas, angkatan) {
		var querys = 'SELECT file.path, file.nama_file_alias, file.jumHal, file.kode_user_fk ' +
						'FROM file ' +
						'RIGHT JOIN socket_room ON file.id_file = socket_room.id_file_fk ' +
						'WHERE socket_room.nama_room = ? ' +
						'AND socket_room.kode_kelas_fk = ? ';
		setImmediate(function () {
			conn.query(querys, [roomId, kdKelas], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					// return res.send('No File Created.');
					return res.send('Err Happen: ' + err);
				}
				if(rows == '') {
					//return res.send('No Presentasion Created.');
					return res.redirect('/');
				} else {
					var dataFile = {
						alias: rows[0].nama_file_alias,
						path: '/pdfToImg/' + S(rows[0].nama_file_alias).chompRight('.pdf').s + '-0.jpg',
						totalPage:rows[0].jumHal,
						kdDosen:rows[0].kode_user_fk
					};
					getUser(dataFile, roomNameAlias, roomId, kdKelas, angkatan);
				}
			});
		});
	}
	function getUser (dataFile, roomNameAlias, roomId, kdKelas, angkatan) {
		setImmediate(function () {
			conn.query('SELECT user.kode_user, user.nama_user FROM user RIGHT JOIN kelas ON user.kode_kelas_fk = kelas.kode_kelas ' +
			'WHERE kelas.kode_kelas = ? AND user.tahun_angkatan = ? AND user.kode_user != ? ORDER BY user.nama_user', 
			[kdKelas, angkatan, kdUser], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.send('Err Happen: ' + err);
				}
				return res.render('user/livePresFile', {
					student: rows,
					data: {
						alias: dataFile.alias,
						path: dataFile.path,
						totalPage: dataFile.totalPage,
						kdDosen: dataFile.kdDosen
					},
					user: req.user,
					title: roomNameAlias,
					roomId: roomId,
					status: true,
					kdKelas: kdKelas,
					type: 'file'
				});
			});
		});
	}
});

router.get('/loadUserOnline', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var roomId = (req.query.rn) ? req.query.rn : 'defaultRoom';
		var typeRequest = (req.query.typeReq) ? req.query.typeReq : 'defaultReq';
		var kdUser = req.user.kode_user;
		/*PAKAI 2 QUERY*/
		// setImmediate(function () {
		// 	conn.query('SELECT COUNT(user_sum.id) as jum FROM user_sum WHERE user_sum.nama_room_fk = ?', roomId,
		// 		function (err, rows) {
		// 		if(err) {
		// 			console.log('query error: ' + err);
		// 			return res.json({status:false, eror:'List Error 1: '+err});
		// 		}
		// 		var totals = rows[0].jum;
		// 		allQuery(totals);
		// 	});
		// });
		// function allQuery(totals) {
			setImmediate(function () {
				conn.query('SELECT user.kode_user, user.nama_user, user_sum.statusOnline ' +
							'FROM user RIGHT JOIN user_sum ' +
							'ON user.kode_user = user_sum.kode_user_fk ' +
							'WHERE user_sum.nama_room_fk = ? AND user.kode_user != ? ' +
							'ORDER BY user.nama_user' , [roomId, kdUser], function (err, rows) {
					if(err) {
						console.log('List Error: ' + err);
						return res.json({status:false, eror:'List Error 2: '+err});
					}
					if(typeRequest == 'refresh') {
						console.log('data statusOnline: ', rows);
						// return res.json({status: true, data: rows, total: totals});
						return res.json({status: true, data: rows});
					} else {
						return res.send('Err Happen: ' + err);
					}
				});
			});
		// }
	}
});

router.get('/downloadPdf', isLoggedIn, function (req, res) {
	var nameFile = req.query.p;
	var typeReq = req.query.t;
	if (typeReq == 'file') {
		res.download(__public + '/uploadFile/' + nameFile);
	};
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;