var localStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt-nodejs');

/*function hashSync (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};*/

function compareSync (password, passDb) {
    return bcrypt.compareSync(password, passDb);
};

module.exports = function(passport, conn) {

	passport.serializeUser(function(user, done) {
		console.log('2_user: ' + JSON.stringify(user));
		/*if(user.level == 'Admin') {
			done(null, user.kode_user);
		} else if(user.level == 'Dosen') {
			done(null, user.kode_user);
		} else {}*/
		done(null, user.kode_user);
		/* yang dimasukkan ke session apa? kode_usernya saja << it's right ?
		*  dan kode_user ini dibawa ke deserializeUser sebagai id :)  */
	});

	passport.deserializeUser(function(id, done) {/*id ini deserializeUser ambil dari session.data di db*/
		console.log('3_id: ' + id);
		var query = 'select user.kode_user,user.nama_user,' +
					'user.level, user.kode_kelas_fk, user.tahun_angkatan from user where user.kode_user = ?';
		conn.query(query, id, function(err, rows) {
			if(err) {
				console.log('Session failed with: ' + err);
			}
			done(err, rows[0]);/*rows[0] itu dikirim ke req.user :) */
		});
	});

	passport.use('local-login-admin', new localStrategy({
		usernameField : 'email',
		passwordField : 'password'
	},
	function(email, password, done) {
		console.log('1_admin');
		setImmediate(function() {// asynchronous effect
			conn.query('SELECT * FROM user WHERE email = ? and level = "Admin"', email, function(err, rows) {
				if(err)
					{	console.log('OPPS MYSQL ERR HAPPEN ON local-login-admin');
						return done(err);}
				if(!rows.length)
					{	console.log('OPPS USER NOT FOUND ON local-login-admin');
						return done(null, false);}// not available user
				if(!compareSync(password, rows[0].password))
					{	console.log('OPPS WRONG PASSWORD ON local-login-admin');
						return done(null, false);}// wrong pass
				return done(null, rows[0]); 
				// rows[0] itu mau di bawa ke mana dib ?
				// rows[0] itu akan diakses oleh passport.serializeUser untuk diseleksi
				// data dari objek user apa yang akan dimasukkan ke dalam session.
				// hasil dari seleksi oleh passport.serializeUser (hanya id aja) yang dimasukkan dalam
				// session adalah di req.session.passport.user. hasil ini juga dilampirkan
				// pada req.user.
			});
		});
	}
	));

	passport.use('local-login-dosen', new localStrategy({
		usernameField : 'email',
		passwordField : 'password'
	},
	function(email, password, done) {
		console.log('1_dosen');
		setImmediate(function() {// asynchronous effect
			conn.query('SELECT * FROM user WHERE email = ? and level = "Dosen"', email, function(err, rows) {
				if(err)
					{	console.log('OPPS MYSQL ERR HAPPEN ON local-login-dosen: ', err);
						return done(err);}
				if(!rows.length)
					{	console.log('OPPS USER NOT FOUND ON local-login-dosen');
						return done(null, false);}// not available user
				if(!compareSync(password, rows[0].password))
					{	console.log('OPPS WRONG PASSWORD ON local-login-dosen');
						return done(null, false);}// wrong pass
				return done(null, rows[0]); 
				// rows[0] itu mau di bawa ke mana dib ?
				// rows[0] itu akan diakses oleh passport.serializeUser untuk diseleksi
				// data dari objek user apa yang akan dimasukkan ke dalam session.
				// hasil dari seleksi oleh passport.serializeUser (hanya id aja) yang dimasukkan dalam
				// session adalah di req.session.passport.user. hasil ini juga dilampirkan
				// pada req.user.
			});
		});
	}
	));
	
	passport.use('local-login-user', new localStrategy({
		usernameField : 'email',
		passwordField : 'password'
	},
	function(email, password, done) {
		console.log('1_user');
		setImmediate(function() {// asynchronous effect
			conn.query('SELECT * FROM user WHERE email = ? and level = "User"', email, function(err, rows) {
				if(err)
					{	console.log('OPPS MYSQL ERR HAPPEN ON local-login-user');
						return done(err);}
				if(!rows.length)
					{	console.log('OPPS USER NOT FOUND ON local-login-user');
						return done(null, false);}// not available user
				if(!compareSync(password, rows[0].password))
					{	console.log('OPPS WRONG PASSWORD ON local-login-user');
						return done(null, false);}// wrong pass
				return done(null, rows[0]);
			});
		});
	}
	));
};