var express = require('express'),
	passport = require('passport'),
	conn = require('../config/database.js'),
	router = express.Router();

router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('/admin/home');
	}
	res.render('admin/login', { title: 'Final Project' });
});

router.post('/login', passport.authenticate('local-login-admin', {
	successRedirect : '/admin/home',
	failureRedirect : '/admin'
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if(req.user.level == 'Admin') {
			req.user.level = 'Administrator';
			console.log('4_adminRoute: ' + JSON.stringify(req.user));
			return next();
		}
	}
	res.redirect('/admin');
}

router.get('/home', isLoggedIn, function(req, res) {
	res.render('admin/index', {
		title: 'Dzulfikar Final Project', 
		user: req.user
	});
});

router.get('/web-rtc', isLoggedIn, function(req, res) {
	res.render('admin/web-rtc', {
		title: 'Dzulfikar Final Project', 
		user: req.user
	});
});

router.get('/user', isLoggedIn, function(req, res) {
	res.render('admin/user', {
		title: 'Dzulfikar Final Project', 
		user: req.user
	});
});

router.get('/kelas', isLoggedIn, function(req, res) {
	res.render('admin/kelas', {
		title: 'Dzulfikar Final Project', 
		user: req.user
	});
});

router.get('/webrtc', isLoggedIn, function(req, res) {
	res.render('admin/webrtc', {
		title: 'Dzulfikar Final Project', 
		user: req.user
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/admin');
});

module.exports = router;