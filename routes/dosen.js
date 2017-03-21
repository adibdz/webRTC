var express = require('express'),
	passport = require('passport'),
	conn = require('../config/database.js'),
	S = require('string'),
	router = express.Router();

router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('/dosen/home');
	}
	res.render('dosen/login', { title: 'Final Project' });
});

router.post('/login', passport.authenticate('local-login-dosen', {
	successRedirect : '/dosen/home',
	failureRedirect : '/dosen'
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if(req.user.level == 'Dosen') {
			console.log('4_dosenRoute: ' + JSON.stringify(req.user));
			return next();
		}
	}
	res.redirect('/dosen');
}

router.get('/home', isLoggedIn, function(req, res) {
	res.render('dosen/index', {
		title: 'Dzulfikar Final Project', 
		user: req.user,
		status: false
	});
});

router.get('/presentation', isLoggedIn, function(req, res) {
	res.render('dosen/presentation', {
		title: 'Dzulfikar Final Project', 
		user: req.user,
		status: false
	});
});

router.get('/slide', isLoggedIn, function(req, res) {
	res.render('dosen/slide', {
		title: 'Dzulfikar Final Project', 
		user: req.user,
		status: false
	});
});

router.get('/livePresReveal', isLoggedIn, function (req, res) {
	setImmediate(function () {
		var kdUser = req.user.kode_user;
		conn.query('SELECT nama_room, id_present_fk, nama_room_alias, kelas.nama_kelas ' + 
					'FROM socket_room LEFT JOIN kelas ON kelas.kode_kelas = socket_room.kode_kelas_fk ' + 
					'WHERE kode_user_fk = ?', kdUser, function (err, rows) {
			if(err) {
				console.log('query error: ' + err);
				// return res.json({status:2, eror:'query error: '+err});
				return res.send('Err Happen: ' + err);
			}
			if(rows == '' || rows[0].id_present_fk == null) {
				return res.redirect('/dosen');
			} else {
				getLivePres(kdUser, rows[0].nama_room, rows[0].id_present_fk, rows[0].nama_room_alias, rows[0].nama_kelas);
			}
		});
	});
	function getLivePres (kdUser, namaRoom, idPres, nama_room_alias, nama_kelas) {
		var querys = 'SELECT sections.judul_isi, sections.isi_section, sections.data_transition, sections.data_background ' +
						'FROM sections ' +
						'RIGHT JOIN slide ON sections.id_present_fk = slide.id_present ' +
						'RIGHT JOIN socket_room ON slide.id_present = socket_room.id_present_fk ' +
						'WHERE socket_room.kode_user_fk = ? ' +
						'AND socket_room.id_present_fk = ? ' +
						'ORDER BY sections.no_section';
		setImmediate(function () {
			conn.query(querys , [kdUser, idPres], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					// return res.json({status:2, eror:err});
					return res.send('Err Happen: ' + err);
				}
				return res.render('dosen/livePresReveal', {
					user: req.user,
					data: rows,
					roomId: namaRoom,
					status: true,
					typePres: 'rev',
					roomAlias: nama_room_alias,
					kelas: nama_kelas
				});
			});
		});
	}
});

router.get('/file', isLoggedIn, function(req, res) {
	res.render('dosen/file', {
		title: 'Dzulfikar Final Project', 
		user: req.user,
		status: false
	});
});

router.get('/livePresFile', isLoggedIn, function(req, res) {
	setImmediate(function () {
		var kdUser = req.user.kode_user;
		conn.query('SELECT socket_room.nama_room, socket_room.id_file_fk, socket_room.nama_room_alias, socket_room.angkatan, kelas.nama_kelas, ' +
					'kelas.kode_kelas, file.nama_file_alias, file.jumHal ' +
					'FROM socket_room LEFT JOIN kelas ON kelas.kode_kelas = socket_room.kode_kelas_fk ' + 
					'LEFT JOIN file on socket_room.id_file_fk = file.id_file ' +
					'WHERE socket_room.kode_user_fk = ?', kdUser, function (err, rows) {
			if(err) {
				console.log('query error: ' + err);
				// return res.json({status:2, eror:'query error: '+err});
				return res.send('Err Happen: ' + err);
			}
			if(rows == '' || rows[0].id_file_fk == null) {
				return res.redirect('/dosen');
			} else {
				getUser(rows[0].nama_file_alias,rows[0].jumHal,rows[0].nama_room, 
					rows[0].nama_room_alias,rows[0].angkatan,rows[0].nama_kelas,rows[0].kode_kelas);
			}
		});
	});
	function getUser (nama_file_alias,jumHal,nama_room,nama_room_alias,angkatan, nama_kelas,kode_kelas) {
		setImmediate(function () {
			conn.query('SELECT user.kode_user, user.nama_user FROM user RIGHT JOIN kelas ON user.kode_kelas_fk = kelas.kode_kelas ' +
			'WHERE kelas.kode_kelas = ? AND user.tahun_angkatan = ? ORDER BY user.nama_user', [kode_kelas, angkatan], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					// return res.json({status:2, eror:'query error: '+err});
					return res.send('Err Happen: ' + err);
				}
				console.log('rows:' , rows);
				return res.render('dosen/livePresFile', {
					user: req.user,
					student: rows,
					data: {
						path: '/pdfToImg/' + S(nama_file_alias).chompRight('.pdf').s + '-0.jpg',
						totalPage:jumHal
					},
					roomId: nama_room,
					status: true,
					typePres: 'file',
					title: nama_room_alias,
					kelas: nama_kelas
				});
			});
		});
	}
});

router.get('/canvas', isLoggedIn, function(req, res) {
	res.render('dosen/canvas', {
		title: 'Dzulfikar Final Project', 
		user: req.user,
		status: false
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/dosen');
});

module.exports = router;