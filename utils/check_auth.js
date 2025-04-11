// utils/check_auth.js
let jwt = require('jsonwebtoken');
let constants = require('./constants');
let userModel = require('../schemas/users');

let check_authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.signedCookies.token;
        console.log('Token in check_authentication:', token);
        if (!token) {
            console.log('No token found');
            req.isAuthenticated = false;
            res.locals.isAuthenticated = false;
            return next();
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        let decoded = jwt.verify(token, constants.SECRET_KEY);
        console.log('Decoded token:', decoded);
        let user = await userModel.findById(decoded.id);
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        req.user = user;
        req.isAuthenticated = true;
        res.locals.isAuthenticated = true;
        res.locals.user = user;
        console.log('User authenticated:', user.username);
        next();
    } catch (error) {
        console.log('Error in check_authentication:', error.message);
        req.isAuthenticated = false;
        res.locals.isAuthenticated = false;
        next();
    }
};

let check_authorization = (role) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.redirect('/auth/login'); // Chuyển hướng nếu chưa đăng nhập
            }
            if (req.user.role !== role) {
                return res.render('error', { title: 'Lỗi', message: 'Bạn không có quyền truy cập' });
            }
            next();
        } catch (error) {
            res.render('error', { title: 'Lỗi', message: error.message });
        }
    };
};

module.exports = { check_authentication, check_authorization };