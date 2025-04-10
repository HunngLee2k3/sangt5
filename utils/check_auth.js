// utils/check_auth.js
let jwt = require('jsonwebtoken');
let constants = require('./constants');
let userModel = require('../schemas/users');

let check_authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization || req.signedCookies.token;
        console.log('Token in check_authentication:', token); // Kiểm tra token
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
        console.log('Decoded token:', decoded); // Kiểm tra token đã giải mã
        let user = await userModel.findById(decoded.id);
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        req.user = user;
        req.isAuthenticated = true;
        res.locals.isAuthenticated = true;
        res.locals.user = user;
        console.log('User authenticated:', user.username); // Kiểm tra user
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
        if (!req.user) {
            throw new Error("Bạn cần đăng nhập");
        }
        if (req.user.role !== role) {
            throw new Error("Bạn không có quyền truy cập");
        }
        next();
    };
};

module.exports = { check_authentication, check_authorization };