// routes/auth.js
var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let { validatorSignIn, validatorCreateUser, validate } = require('../utils/validators'); // Sửa import
let constants = require('../utils/constants');
let jwt = require('jsonwebtoken');

/* GET login page */
router.get('/login', function(req, res, next) {
    if (req.isAuthenticated) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login' });
});

/* POST login */
router.post('/login', validatorSignIn, validate, async function(req, res, next) {
    try {
        let body = req.body;
        let user = await userController.CheckLogin(body.username, body.password);
        let exp = new Date(Date.now() + 60 * 60 * 1000);
        let token = jwt.sign({
            id: user._id,
            expire: exp.getTime()
        }, constants.SECRET_KEY);
        res.cookie('token', token, {
            httpOnly: true,
            expires: exp,
            signed: true,
            sameSite: 'Strict'
        });
        console.log('Token set in cookie:', token);
        res.redirect('/');
    } catch (error) {
        res.render('login', { title: 'Login', error: error.message });
    }
});

/* GET signup page */
router.get('/signup', function(req, res, next) {
    if (req.isAuthenticated) {
        return res.redirect('/');
    }
    res.render('signup', { title: 'Sign Up' });
});

/* POST signup */
router.post('/signup', validatorCreateUser, validate, async function(req, res, next) {
    try {
        let body = req.body;
        let newUser = await userController.CreateAnUser(
            body.username,
            body.password,
            body.email,
            'user'
        );
        let exp = new Date(Date.now() + 60 * 60 * 1000);
        let token = jwt.sign({
            id: newUser._id,
            expire: exp.getTime()
        }, constants.SECRET_KEY);
        res.cookie('token', token, {
            httpOnly: true,
            expires: exp,
            signed: true,
            sameSite: 'Strict'
        });
        console.log('Token set in cookie:', token);
        res.redirect('/');
    } catch (error) {
        res.render('signup', { title: 'Sign Up', error: error.message });
    }
});

/* GET logout */
router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

module.exports = router;