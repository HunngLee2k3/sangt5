// routes/users.js
var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let { validatorCreateUser, validate } = require('../utils/validators'); // Đảm bảo import validatorCreateUser

/* GET users listing */
router.get('/', async function(req, res, next) {
    try {
        let users = await userController.GetAllUsers();
        res.json(users);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/* POST create user */
router.post('/', validatorCreateUser, validate, async function(req, res, next) {
    try {
        let body = req.body;
        let user = await userController.CreateAnUser(
            body.username,
            body.password,
            body.email,
            body.role || 'user'
        );
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;