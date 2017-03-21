var express = require('express'),
	conn = require('../config/database.js'),
	router = express.Router(),
	S = require('string'),
	fs = require('fs-extra'),
	formidable = require('formidable'),
	randomString = require('random-string'),
	shell = require('shelljs'),
	im = require('imagemagick');

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if(req.user.level == 'Dosen') {
			console.log('4_ajaxRouteDosen: ' + JSON.stringify(req.user));
			return next();
		}
	}
	res.redirect('/dosen');
}

/*
*	Slide
*
*/

router.post('/getFlexSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var id = req.user.kode_user;
		var page = (req.body.page) ? req.body.page : 1,
			rp = (req.body.rp) ? req.body.rp : 10,
			sortname = (req.body.sortname) ? req.body.sortname : 'slide.nama_matkul_slide',
			sortorder = (req.body.sortorder) ? req.body.sortorder : 'asc',
			querys = (req.body.query) ? req.body.query : '',
			qtype = (req.body.qtype) ? req.body.qtype : '';
			
		var sort = 'ORDER BY ' + sortname + ' ' + sortorder + ' ',
			start = ((page - 1) * rp),
			limit = 'LIMIT ' + start + ', ' + rp;

		var where = 'WHERE slide.kode_user_fk = ? ';
		if(querys) {
			where = where + 'AND ' + qtype + ' LIKE ' + '"%' + querys + '%" ';
		}

		var query = "SELECT slide.id_present,slide.kode_matkul_slide,slide.nama_matkul_slide, " +
					"slide.chapter,count(sections.no_section) AS jum,user.nama_user ",
			query_from = "FROM slide LEFT JOIN sections on slide.id_present = sections.id_present_fk " +
						 "LEFT JOIN user on slide.kode_user_fk = user.kode_user ";
		setImmediate(function () {
			conn.query('SELECT COUNT(*) as total FROM slide inner join user on ' +
						'slide.kode_user_fk = user.kode_user  ' + where, id, function (err, rows) {
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
				conn.query(query + query_from + where + 'GROUP BY slide.id_present ' + sort + limit, id, function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					var isi = new Array();
					for (var i = 0; i < rows.length; i++) {
						isi.push({'cell': [rows[i].id_present,
	                                    rows[i].kode_matkul_slide,
	                                    rows[i].nama_matkul_slide,
	                                    rows[i].chapter,
	                                    rows[i].jum,
	                                    rows[i].nama_user]});
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

router.get('/loadFormAddSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		return res.render('dosen/modal/addSlide');
	}
});

router.post('/addDataSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.body.idPresent;
		// console.log('key: ' + S(key).replaceAll(' ','_').s);
		var data = {
			id_present : S(key).replaceAll(' ','_').s,
			kode_matkul_slide : req.body.kdMakul,
			nama_matkul_slide : req.body.nMakul,
			chapter : req.body.chapter,
			kode_user_fk : req.user.kode_user
		};
		setImmediate(function () {
			conn.query('INSERT INTO slide SET ?', data, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'ID presentasi sudah ada'});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/loadFormEditSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.query.key;
		setImmediate(function () {
			conn.query('SELECT * FROM slide WHERE id_present = ?', key, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.render('dosen/modal/editSlide', {
					data: rows 
				});
			});
		});
	}
});

router.post('/editDataSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.body.idPresent;
		var data = {
			kode_matkul_slide : req.body.kdMakul,
			nama_matkul_slide : req.body.nMakul,
			chapter : req.body.chapter
		};
		setImmediate(function () {
			conn.query('UPDATE slide SET ? WHERE id_present = ?', [data, key], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'Kode mata kuliah tidak boleh sama!'});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/hapusSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.query.key;
		setImmediate(function () {
			conn.query('DELETE FROM slide WHERE id_present = ?', key, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.json({status:1});
			});
		});
	}
});

/*
*	Sections
*
*/

router.post('/getFlexSections', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var id = req.user.kode_user;
		var page = (req.body.page) ? req.body.page : 1,
			rp = (req.body.rp) ? req.body.rp : 10,
			sortname = (req.body.sortname) ? req.body.sortname : 'id_present',
			sortorder = (req.body.sortorder) ? req.body.sortorder : 'asc',
			querys = (req.body.query) ? req.body.query : '',
			qtype = (req.body.qtype) ? req.body.qtype : '';
			
		var sort = 'ORDER BY ' + sortname + ' ' + sortorder + ' ',
			start = ((page - 1) * rp),
			limit = 'LIMIT ' + start + ', ' + rp;

		var where = 'where slide.kode_user_fk = ? ';
		if(querys) {
			where = where + 'AND ' + qtype + ' LIKE ' + '"%' + querys + '%" ';
		}

		var query = "SELECT slide.id_present,sections.no_section,sections.judul_isi, " +
					"sections.isi_section,sections.data_transition,sections.data_background	 ",
			query_from = "FROM sections LEFT JOIN slide on sections.id_present_fk = slide.id_present  ";
		setImmediate(function () {
			conn.query('SELECT COUNT(*) as total ' + query_from +  where, id, function (err, rows) {
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
				conn.query(query + query_from + where + sort + limit, id, function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					var isi = new Array();
					for (var i = 0; i < rows.length; i++) {
						isi.push({'cell': [rows[i].id_present,
	                                    rows[i].no_section,
	                                    rows[i].judul_isi,
	                                    rows[i].isi_section,
	                                    rows[i].data_transition,
	                                    rows[i].data_background]});
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

router.get('/getJumSec', isLoggedIn, function (req, res) {
	if(req.xhr) {
		setImmediate(function () {
			var key = req.user.kode_user,
				idPresent = req.query.idpresent;
			conn.query('SELECT COUNT(sections.no_section) as jumSlide FROM sections LEFT JOIN slide ' + 
						'ON sections.id_present_fk = slide.id_present WHERE slide.kode_user_fk = ? ' +
						'AND sections.id_present_fk = ?' , [key, idPresent],
						function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				//console.log('jumSlide: ' + rows[0].jumSlide);
				//var slideKe = rows[0].jumSlide + 1;
				/*var obj = {
					slideKe: rows[0].jumSlide + 1
				};*/
				return res.json({slideKe:rows[0].jumSlide + 1});
			});
		});
	}
});

router.get('/loadFormAddSections', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var kdUser = req.user.kode_user;
		setImmediate(function () {
			conn.query('SELECT id_present FROM slide WHERE kode_user_fk = ?', kdUser, function (err, rows) {
				if(err) {
					return console.log('query error: ' + err);
				}
				return res.render('dosen/modal/addSections', {data:rows});
			});
		});
	}
});

router.post('/addDataSections', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var randomKey = randomString({
	        length: 60,
	        numeric: true,
	        letters: true,
	        special: false
	    });
		var data = {
			id_sections: randomKey,
			no_section : req.body.section,
			judul_isi : req.body.judul,
			isi_section : req.body.isi,
			data_transition : req.body.dTrans,
			data_background : req.body.dback,
			id_present_fk : req.body.idPresent
		};
		setImmediate(function () {
			conn.query('INSERT INTO sections SET ?', data, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:err});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/loadFormEditSections', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var idPres = req.query.idPres,
			idSec = req.query.idSec;
		setImmediate(function () {
			conn.query('SELECT * FROM sections WHERE id_present_fk = ? AND no_section = ?', [idPres, idSec], 
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.render('dosen/modal/editSections', {
					data: rows
				});
			});
		});
	}
});

router.post('/editDataSections', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var idSec = req.body.section,
			idPres = req.body.idPresent;
		var data = {
			judul_isi : req.body.judul,
			isi_section : req.body.isi,
			data_transition : req.body.dTrans,
			data_background : req.body.dback
		};
		setImmediate(function () {
			conn.query('UPDATE sections SET ? WHERE id_present_fk = ? AND no_section = ?', [data, idPres, idSec], 
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:err});
				}
				return res.json({status:1});
			});
		});
	}
});

router.get('/hapusSection', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var idPres = req.query.idPres,
			idSec = req.query.idSec;
		setImmediate(function () {
			conn.query('DELETE FROM sections WHERE id_present_fk = ? AND no_section = ?', [idPres, idSec], 
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.json({status:1});
			});
		});
	}
});

/*
*	room
*
*/

router.get('/cekPresentasi', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var kdUser = req.user.kode_user;
		setImmediate(function () {
			conn.query('SELECT nama_room FROM socket_room WHERE kode_user_fk = ?', kdUser, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				if(rows == '') {
					/* tidak ada kode user (dosen) ybs di tabel socket_room
					   maksudnya dosen belum membuat room. */	
					return res.json({status:false});
				} else {
					/* ada kode user (dosen) ybs di tabel socket_room
					   maksudnya dosen sudah membuat room. */
					return res.json({status:true});
				}
			});
		});
	}
});

router.get('/cekJumSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var kdUser = req.user.kode_user,
			idPres = req.query.key;
		setImmediate(function () {
			conn.query('SELECT count(sections.no_section) AS jum FROM slide LEFT JOIN sections on slide.id_present = sections.id_present_fk ' +
						'WHERE slide.kode_user_fk = ? AND slide.id_present = ?', [kdUser, idPres],
						function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				if(rows[0].jum == 0) {
					return res.json({status:false}); // tidak ada slide
				} else {
					return res.json({status:true}); // ada slide
				}
			});
		});
	}
});

router.get('/loadFormAddRoom', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var idPres = req.query.key,
			kdUser = req.user.kode_user,
			reveal = req.query.reveal,
			showKey = false;
		// console.log('reveal: ' + reveal);
		if(reveal == 'true') { 
			showKey = true;
		} else {
			showKey = false;
		}
		// console.log('showKey: ' + showKey);
		setImmediate(function () {
			conn.query('SELECT * FROM kelas', function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:'query error: '+err});
				}
				return res.render('dosen/modal/addRoom', {
					data: rows,
					idPres: idPres,
					kdUser: kdUser,
					showKey: showKey
				});
			});
		});
	}
});

router.post('/addDataRoom', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var cekPresentType = req.body.cekPresentType;
		// console.log('cekPresentType: ' + cekPresentType);
		var randomKey = randomString({
	        length: 60,
	        numeric: true,
	        letters: true,
	        special: false
	    });
	    var data = null;
	    if(cekPresentType == 'true') {
	    	console.log('present insert to socket room');
	    	data = {
				nama_room: randomKey,
				kode_user_fk: req.body.nip,
				kode_kelas_fk: req.body.kelas,
				id_present_fk: req.body.idPres,
				nama_room_alias: req.body.roomName,
				id_file_fk: null,
				angkatan: req.body.angkatan
			};
			insertRoom(data);
	    } else {
	    	console.log('file insert to socket room');
	    	data = {
				nama_room: randomKey,
				kode_user_fk: req.body.nip,
				kode_kelas_fk: req.body.kelas,
				id_present_fk: null,
				nama_room_alias: req.body.roomName,
				id_file_fk: req.body.idPres,
				angkatan: req.body.angkatan
			};
			setImmediate(function () {
				conn.query('SELECT nama_file_alias FROM file WHERE id_file = ?', req.body.idPres, function (err, rows) {
					if(err) {
						console.log('query error: ' + err);
						return false;
					}
					pdfToImage(rows[0].nama_file_alias);
				});
			});
			function pdfToImage (file_name) {
				// console.log('----->>file_name: ' + file_name);
				var fileNameConv =  S(file_name).chompRight('.pdf').s;
				im.convert([__public + '/uploadFile/' + file_name, __public + '/pdfToImg/' + fileNameConv + '.jpg'], 
					function(err, stdout) {
						if (err) {
							// throw err;
							return false;
						}
						console.log('Sukses Convert, nama file: ' + file_name);
						getJumPage(file_name, data);
						// insertRoom(data);
				});
			}
	    }
	    function getJumPage(file_name, data) {
	    	var cek = true,
	    		pathFile = __public + '/uploadFile/' + file_name;
	    	// console.log('Path File: ' + pathFile);
	    	// var command = 'pdfinfo ' + pathFile + ' | grep Pages: | awk "{print $2}"';
	    	var command = 'pdfinfo ' + pathFile + ' | grep Pages:';
	    	var child = shell.exec(command, {async: true, silent: true});  		
	  		child.stdout.on('data', function(data) {
				// console.log('data: ', data);
				var editData = S(data).replaceAll(' ','').s;
				// console.log('data Editted: ', S(editData).replaceAll('Pages:','').s);
				var jum = S(editData).replaceAll('Pages:','').s;
				updatejumHal(jum);
			});
	    }
	    function updatejumHal (jum) {
	    	setImmediate(function () {
	    		conn.query('UPDATE file SET jumHal = ? WHERE id_file = ?', [jum, data.id_file_fk], function (err, rows) {
	    			if (err) {
						// throw err;
						return false;
					}
					console.log('Sukses Update');
	    			insertRoom(data);
	    		});
	    	});
	    }
	    function insertRoom (data) {
	    	setImmediate(function () {
				conn.query('INSERT INTO socket_room SET ?', data, function (err, rows) {
					if(err) {
						console.log('query error: ' + err);
						return res.json({status:2, eror:err});
					}
					return res.json({status:1});
				});
			});
	    }
	}	
});

/*
*	livePres
*
*/

router.get('/endPres', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var roomId = (req.query.rn) ? req.query.rn : 'default';
		var typePres = (req.query.type) ? req.query.type : 'default';
		var kdUser = req.user.kode_user;
		console.log('/endPres roomId: ' + roomId + ', kdUser: ' + kdUser);
		if(roomId == 'default') {
			return res.redirect('/dosen');
		}
		if(typePres == 'file') {
			setImmediate(function () {
				conn.query('SELECT file.nama_file_alias, file.jumHal FROM file RIGHT JOIN socket_room ON file.id_file = socket_room.id_file_fk ' + 
					'WHERE socket_room.nama_room = ? AND socket_room.kode_user_fk = ?', [roomId, kdUser],
					function (err, rows) {
					if(err) {
						console.log('query error: ' + err);
						return res.json({status:false, err:err});
					} else {
						console.log('delete, rows: ', rows);
						hapusImage(rows[0].nama_file_alias, rows[0].jumHal);
					}		
				});
			});
			function hapusImage (fileName, jumHal) {
				var cek = true,
				fileNameConv = S(fileName).chompRight('.pdf').s;
				for (var i = 0; i < jumHal; i++) {
					console.log('hapus file ke: ' + i + '\n');
					fs.removeSync(__public + '/pdfToImg/' + fileNameConv + '-' + i + '.jpg', function (err) {
						if(err) {
							console.log('Delete Error: ' + err);
							return false;	
						}
						// console.log('File: ' + __public + '/pdfToImg/' + fileNameConv + '-' + i + '.jpg terhapus');
					});	
				};
				console.log('akan eksekusi deleteData()');
				deleteData();
			}
		} else {
			deleteData();
		}
		function deleteData () {
		 	setImmediate(function () {
				conn.query('DELETE FROM socket_room WHERE nama_room = ? AND kode_user_fk = ?' , [roomId, kdUser], 
					function (err, rows) {
					if(err) {
						console.log('query error: ' + err);
						return res.json({status:false, err:err});
					}
					// hapusChat();
					return res.json({status:true});
				});
			});	
		}
	} else {
		res.send('Ente Bahlul XD');
	}
});

/*
*	alert
*
*/

router.get('/alertOnAir', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.user.kode_user;
		setImmediate(function () {
			conn.query('SELECT id_file_fk FROM socket_room WHERE kode_user_fk = ?', key, function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
				}
				// console.log('rows: ', rows);
				var link = '';
				if(rows[0].id_file_fk == null) {
					link = '/dosen/livePresReveal';
				} else {
					link = '/dosen/livePresFile';
				}
				return res.render('dosen/modal/alertOnAir', {link:link});
			});
		});
	}
});

router.get('/alertCreateSlide', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var key = req.query.key;
		return res.render('dosen/modal/alertCreateSlide', {key:key});
	}
});

/*
*	studentOnline
*
*/

router.get('/loadUserOnline', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var roomId = (req.query.rn) ? req.query.rn : 'defaultRoom';
		var nama_kelas = (req.query.kl) ? req.query.kl : 'defaultKelas';
		var typeRequest = (req.query.typeReq) ? req.query.typeReq : 'defaultReq';
		/*PAKAI 2 QUERY*/
		setImmediate(function () {
			conn.query('SELECT COUNT(user_sum.id) as jum FROM user_sum WHERE user_sum.nama_room_fk = ? ', roomId,
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:false, eror:'List Error 1: '+err});
				}
				var totals = rows[0].jum;
				allQuery(totals);
			});
		});
		function allQuery(totals) {
			setImmediate(function () {
				conn.query('SELECT user.kode_user, user.nama_user, user_sum.statusOnline ' +
							'FROM user RIGHT JOIN user_sum ' +
							'ON user.kode_user = user_sum.kode_user_fk ' +
							'WHERE user_sum.nama_room_fk = ? ORDER BY user.nama_user' , roomId, function (err, rows) {
					if(err) {
						console.log('List Error: ' + err);
						return res.json({status:false, eror:'List Error 2: '+err});
					}
					if(typeRequest == 'refresh') {
						return res.json({status: true, data: rows, total: totals});
					} else if(typeRequest == 'button') {
						return res.render('dosen/modal/listUserOnline', {
							data: rows,
							total: totals,
							nama_kelas: nama_kelas,
						});
					} else {
						return res.redirect('/dosen');
					}
				});
			});
		}
	}
});

router.get('/updateUserOnline', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var roomId = req.query.rn;
		setImmediate(function () {
			conn.query('SELECT COUNT(user_sum.id) as jum FROM user_sum WHERE user_sum.nama_room_fk = ? ', roomId,
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:false, eror:'List Error 1: '+err});
				}
				var totals = rows[0].jum;
				allQuery(totals);
			});
		});
		function allQuery(totals) {
			setImmediate(function () {
				conn.query('SELECT user.kode_user, user.nama_user, user_sum.statusOnline ' +
							'FROM user RIGHT JOIN user_sum ' +
							'ON user.kode_user = user_sum.kode_user_fk ' +
							'WHERE user_sum.nama_room_fk = ? ORDER BY user.nama_user' , roomId, function (err, rows) {
					if(err) {
						console.log('List Error: ' + err);
						return res.json({status:false, eror:+err});
					}
					return res.json({
						status: true,
						data: rows,
						total: totals
					});
				});
			});
		}
	}
});

/*
*	File Upload
*
*/

router.post('/getFlexFile', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var id = req.user.kode_user;
		var page = (req.body.page) ? req.body.page : 1,
			rp = (req.body.rp) ? req.body.rp : 10,
			sortname = (req.body.sortname) ? req.body.sortname : 'kode_matkul_present',
			sortorder = (req.body.sortorder) ? req.body.sortorder : 'asc',
			querys = (req.body.query) ? req.body.query : '',
			qtype = (req.body.qtype) ? req.body.qtype : '';
			
		var sort = 'ORDER BY ' + sortname + ' ' + sortorder + ' ',
			start = ((page - 1) * rp),
			limit = 'LIMIT ' + start + ', ' + rp;

		var where = 'WHERE user.kode_user = ?';
		if(querys) {
			where = where + 'AND ' + qtype + ' LIKE ' + '"%' + querys + '%" ';
		}

		var query = "SELECT file.id_file, file.nama_file_alias, file.kode_matkul_present, file.nama_matkul_present, " +
					"file.chapter, user.nama_user, file.path ";
			query_from = "FROM file LEFT JOIN user ON file.kode_user_fk = user.kode_user ";
		setImmediate(function () {
			conn.query('SELECT COUNT(*) as total ' + query_from +  where, id, function (err, rows) {
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
				conn.query(query + query_from + where + sort + limit, id, function (err, rows) {
					if(err) {
						return console.log('query error: ' + err);
					}
					var isi = new Array();
					for (var i = 0; i < rows.length; i++) {
						isi.push({'cell': [rows[i].id_file,
	                                    rows[i].nama_file_alias,
	                                    rows[i].kode_matkul_present,
	                                    rows[i].nama_matkul_present,
	                                    rows[i].chapter,
	                                    rows[i].nama_user,
	                                    rows[i].path]});
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

router.get('/loadFormUpload', isLoggedIn, function (req, res) {
	if(req.xhr) {
		return res.render('dosen/modal/addFile');
	}
});

router.post('/addDataFile', isLoggedIn, function (req, res) {
	// if(req.xhr) {
		var form = new formidable.IncomingForm();
		var kdMakul = '',
			nMakul = '',
			chapter = '',
			fileName = '';
		var random = randomString({
	    	length: 10,
	    	numeric: true,
	    	letters: true,
	    	special: false
	    });
	    var now = new Date();
		var tanggalFileUpload = now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate();
		form.parse(req, function(err, fields, files) {
			kdMakul = fields.kdMakul;
			nMakul = fields.nMakul;
			chapter = fields.chapter;
			fileName = S(req.user.kode_user + '_' + S(files.profile_image.name).chompRight('.pdf')
				+ '_' + tanggalFileUpload + '.pdf').replaceAll(' ','_');
    	});

		form.on('progress', function(bytesReceived, bytesExpected) {
	        // var percent_complete = (bytesReceived / bytesExpected) * 100;
	        // console.log(percent_complete.toFixed(2));
	    });
	 
	    form.on('error', function(err) {
	        console.log('error uploading: ', err);
	    });

		form.on('end', function(fields, files) {
	        var temp_path = this.openedFiles[0].path;
	        // var file_name = req.user.kode_user + '_' + this.openedFiles[0].name;
	        // S(file_name).chompRight('.pdf').s
	        var delExtPdf = S(this.openedFiles[0].name).chompRight('.pdf').s;
	        // var file_name = S(req.user.kode_user + '_' + this.openedFiles[0].name).replaceAll(' ','_');
	        
	        var file_name = S(req.user.kode_user + '_' + delExtPdf + '_' + tanggalFileUpload + '.pdf').replaceAll(' ','_');
	        var new_location = __public + '/uploadFile/';
	        console.log('file_name: '+ file_name);
	        var ext = S(file_name).right(3).s;
	 		if((ext == 'pdf') || (ext == 'odf')) {
		        fs.copy(temp_path, new_location + file_name, function(err) {  
		            if (err) {
		                return console.error(err);
		            } else {
		                // console.log("success upload");
		                deleteTmp(temp_path);
		            }
		        });
		    } else {
		    	return res.json({status:3, message:'Wrong File'});
		    }
	        function deleteTmp (tmpPath) {
	        	// console.log('tmpPath: ' + tmpPath);
	        	fs.remove(tmpPath, function (err) {
	        		if(err) {
	        			console.log('Delete Error: ' + err);
						return res.json({status:2, eror:err});
	        		}
	        		insertData(); /* Sukses hapus /tmp/ */
	        	});
	        }
	        function insertData () {
	        	var randomKey = randomString({
	        		length: 60,
	        		numeric: true,
	        		letters: true,
	        		special: false
	        	});
	        	
				var data = {
					id_file : randomKey,
					kode_matkul_present : kdMakul,
					nama_matkul_present : nMakul,
					chapter : chapter,
					kode_user_fk : req.user.kode_user,
					path : '/uploadFile/',
					nama_file_alias : fileName
				};
				
				setImmediate(function () {
					conn.query('INSERT INTO file SET ?', data, function (err, rows) {
						if(err) {
							console.log('query error: ' + err);
							return res.json({status:2, eror:err});
						}
						return res.json({status:1});
					});
				});
	        }
	    });
	// }
});

router.post('/hapusFileUpload', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var idFile = req.body.key;
		// console.log('ID HAPUS: ' + idFile);
		setImmediate(function () {
			conn.query('SELECT path, nama_file_alias FROM file WHERE id_file = ?', idFile, 
				function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					return res.json({status:2, eror:err});
				}
				hapusFile(rows[0].path, rows[0].nama_file_alias);
			});
		});
		function hapusFile(path, alias) {
			fs.remove(__public + path + alias, function (err) {
		        if(err) {
		        	console.log('Delete Error: ' + err);
					return res.json({status:2, eror:err});
		        }
		        console.log('HAPUS FILE: ' + alias + ' SUKSES');
		        hapusDbFile(idFile);
		    });	
		}
		function hapusDbFile (key) {
			setImmediate(function () {
				conn.query('DELETE FROM file WHERE id_file = ?', key, function (err, rows) {
					if(err) {
						console.log('query error: ' + err);
						return res.json({status:2, eror:err});
					}
					return res.json({status:1});
				});
			});
		}
	}
});

/*
*	Get Image, Next, Previous
*
*
*/

router.get('/getImageNext', isLoggedIn, function (req, res) {
	if(req.xhr) {
		var roomName = req.query.rn,
			kdUser = req.query.kdUser,
			page = req.query.page;
		setImmediate(function () {
			conn.query('SELECT file.nama_file_alias, file.jumHal FROM file ' +
						'RIGHT JOIN socket_room ON file.id_file = socket_room.id_file_fk ' +
						'WHERE socket_room.nama_room = ? ' +
						'AND socket_room.kode_user_fk = ? ', [roomName, kdUser], function (err, rows) {
				if(err) {
					console.log('query error: ' + err);
					// return res.json({status:false, eror:err});
					return false;
				}
				// console.log('rows: ', rows);
				if((page < rows[0].jumHal) && (page >= 0)) {
					var path = '/pdfToImg/' + S(rows[0].nama_file_alias).chompRight('.pdf').s + '-' + page + '.jpg';
					return res.json({status:true, data:path});
				} else {
					var path = '/pdfToImg/' + S(rows[0].nama_file_alias).chompRight('.pdf').s + '-0.jpg';
					return res.json({status:'end', data:path});
					// return res.json({status:'end'});
				}
			});
		});
	}
});

module.exports = router;