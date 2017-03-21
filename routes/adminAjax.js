var express = require('express'),
	conn = require('../config/database.js'),
	bcrypt = require('bcrypt-nodejs'),
	router = express.Router(),
	S = require('string');

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if(req.user.level == "Admin") {
			req.user.level = 'Administrator'
			console.log('4_ajaxRouteAdmin: ' + JSON.stringify(req.user));
			return next();
		}
	}
	return res.redirect('/admin');
}

/*
*	User
*
*/

router.post('/getFlexUser', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var page = (req.body.page) ? req.body.page : 1,
			rp = (req.body.rp) ? req.body.rp : 10,
			sortname = (req.body.sortname) ? req.body.sortname : 'nama_user',
			sortorder = (req.body.sortorder) ? req.body.sortorder : 'asc',
			querys = (req.body.query) ? req.body.query : '',
			qtype = (req.body.qtype) ? req.body.qtype : '';
			
		var sort = 'ORDER BY ' + sortname + ' ' + sortorder + ' ',
			start = ((page - 1) * rp),
			limit = 'LIMIT ' + start + ', ' + rp;

		var query = "SELECT user.kode_user,user.email,user.nama_user,user.level,kelas.nama_kelas,user.tahun_angkatan ",
			query_from = "FROM user LEFT JOIN kelas ON user.kode_kelas_fk = kelas.kode_kelas ";
		setImmediate(function () {
			conn.query('SELECT COUNT(*) as total ' + query_from, function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				/*JSON.stringify()*/
				var totals = rows[0].total;
				allQuery(totals);
			});
		});
		function allQuery(totals) {
			setImmediate(function () {
				conn.query(query + query_from + sort + limit, function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					var isi = new Array();
					for (var i = 0; i < rows.length; i++) {
						isi.push({'cell': [rows[i].kode_user,
	                                    rows[i].email,
	                                    rows[i].nama_user,
	                                    rows[i].level,
	                                    rows[i].nama_kelas,
	                                    rows[i].tahun_angkatan]});
					};
					var obj = {
						'page': page,
						'rp': rp,
						'sortname': sortname,
						'sortorder': sortorder,
						'query': '',
						'qtype': '',
						'total': totals.toString(),
						'rows': isi
					};
					//console.log(JSON.stringify(obj));
					return res.send(JSON.stringify(obj));
				});
			});
		}
	}
});

router.get('/loadFormAddUser', isLoggedIn, function (req, res) {
	if(req.xhr) {
		setImmediate(function () {
			conn.query('SELECT kode_kelas as kode, ' +
						 'nama_kelas as kelas FROM kelas ORDER BY kode_kelas', function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				//console.log(rows);
				return res.render('admin/modal/addUser', { data:rows });
			});
		});
	}
});

router.post('/addDataUser', isLoggedIn, function (req, res) {
	function hashSync(password) {
	    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};
	if(req.xhr) {
		var data =  {
			kode_user : req.body.idUser,
			email : req.body.email,
			password : hashSync(req.body.password),
			nama_user : req.body.name,
			level : req.body.level,
			kode_kelas_fk : (req.body.kelas) ? req.body.kelas : null,
			tahun_angkatan : (req.body.thAngkatan) ? req.body.thAngkatan : null
		};
		setImmediate(function () {
			conn.query('INSERT INTO user set ?', data, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'ID atau Email sudah ada'});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/loadFormEditUser', isLoggedIn, function (req, res) {
	if(req.xhr) {
		//console.log('key: ' + req.query.key);
		var key = req.query.key;
		setImmediate(function () {
			conn.query('SELECT user.kode_user,user.email,user.nama_user,user.level,' +
				' kelas.kode_kelas,user.tahun_angkatan' +
				' FROM user LEFT JOIN kelas ON user.kode_kelas_fk = kelas.kode_kelas' +
				' WHERE user.kode_user = ?', key, function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				//console.log(rows);
				var nilaiLevel = false;
				if(rows[0].level == 'User') { nilaiLevel = true; }
				rows[0].cekLevel = nilaiLevel;
				//console.log(rows);
				getKelas(rows);
			});
		});
		function getKelas(dataUser) {
			setImmediate(function () {
				conn.query('SELECT kode_kelas as kode, ' +
						 'nama_kelas as kelas FROM kelas ORDER BY kode_kelas', function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					return res.render('admin/modal/editUser', { 
						data: dataUser,
						kelas: rows 
					});
				});
			});
		}
	}
});

router.post('/editDataUser', isLoggedIn, function (req, res) {
	function hashSync(password) {
	    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};
	if(req.xhr) {
		var cekPass = req.body.password,
			idUser = req.body.idUser,
			data;
		if(cekPass != '') {
			data = {
				email : req.body.email,
				password : hashSync(req.body.password),
				nama_user : req.body.name,
				level : req.body.level,
				kode_kelas_fk : (req.body.kelas) ? req.body.kelas : null,
				tahun_angkatan : (req.body.thAngkatan) ? req.body.thAngkatan : null
			};
		} else {
			data = {
				email : req.body.email,
				nama_user : req.body.name,
				level : req.body.level,
				kode_kelas_fk : (req.body.kelas) ? req.body.kelas : null,
				tahun_angkatan : (req.body.thAngkatan) ? req.body.thAngkatan : null
			};
		}
		setImmediate(function () {
			conn.query('UPDATE user SET ? WHERE kode_user = ?', [data, idUser], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'ID atau Email sudah ada'});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/hapusUser', isLoggedIn, function (req, res) {
	var key = req.query.key;
	//console.log('key: ' + key);
	setImmediate(function () {
		conn.query('DELETE FROM user WHERE kode_user = ?', key, function (err, rows) {
			if(err) {
				console.log('query error: ' + err);
				return res.json({status:2, eror:err});
			}
			return res.json({status:1});
		});
	});
});

/*
*	Kelas
*
*/

router.post('/getFlexKelas', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var page = (req.body.page) ? req.body.page : 1,
			rp = (req.body.rp) ? req.body.rp : 10,
			sortname = (req.body.sortname) ? req.body.sortname : 'kode_kelas',
			sortorder = (req.body.sortorder) ? req.body.sortorder : 'asc',
			querys = (req.body.query) ? req.body.query : '',
			qtype = (req.body.qtype) ? req.body.qtype : '';
			
		var sort = 'ORDER BY ' + sortname + ' ' + sortorder + ' ',
			start = ((page - 1) * rp),
			limit = 'LIMIT ' + start + ', ' + rp;

		var query = "SELECT * ",
			query_from = "FROM kelas ";
		setImmediate(function () {
			conn.query('SELECT COUNT(*) as total ' + query_from, function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				/*JSON.stringify()*/
				var totals = rows[0].total;
				allQuery(totals);
			});
		});
		function allQuery(totals) {
			setImmediate(function () {
				conn.query(query + query_from + sort + limit, function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					var isi = new Array();
					for (var i = 0; i < rows.length; i++) {
						isi.push({'cell': [ rows[i].kode_kelas, rows[i].nama_kelas ] });
					};
					var obj = {
						'page': page,
						'rp': rp,
						'sortname': sortname,
						'sortorder': sortorder,
						'query': '',
						'qtype': '',
						'total': totals.toString(),
						'rows': isi
					};
					//console.log(JSON.stringify(obj));
					return res.send(JSON.stringify(obj));
				});
			});
		}
	}
});

router.get('/loadFormAddKelas', isLoggedIn, function (req, res) {
	if(req.xhr) {
		res.render('admin/modal/addKelas');
	}
});

router.post('/addDataKelas', isLoggedIn, function (req, res) {
	// function hashSync(password) {
	//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	// };
	if(req.xhr) {
		var data = {
			kode_kelas : req.body.idKelas,
			nama_kelas : req.body.kelas
		};
		setImmediate(function () {
			conn.query('INSERT INTO kelas set ?', data, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'ID Kelas sudah ada'});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/loadFormEditKelas', isLoggedIn, function (req, res) {
	if(req.xhr) {
		//console.log('key: ' + req.query.key);
		var key = req.query.key;
		setImmediate(function () {
			conn.query('SELECT * FROM kelas WHERE kode_kelas = ?', key, function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				res.render('admin/modal/editKelas', {data: rows});
			});
		});
	}
});

router.post('/editDataKelas', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.body.idKelas;
		var data = {
			nama_kelas: req.body.kelas			
		};
		setImmediate(function () {
			conn.query('UPDATE kelas SET ? WHERE kode_kelas = ?', [data, key], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:err});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/hapusKelas', isLoggedIn, function (req, res) {
	var key = req.query.key;
	//console.log('key: ' + key);
	setImmediate(function () {
		conn.query('DELETE FROM kelas WHERE kode_kelas = ?', key, function (err, rows) {
			if(err) {
				console.log('query error: ' + err);
				return res.json({status:2, eror:'Kelas masih terdapat mahasiswa'});
			}
			return res.json({status:1});
		});
	});
});

module.exports = router;