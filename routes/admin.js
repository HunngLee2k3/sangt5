// routes/admin.js
var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let { check_authentication, check_authorization } = require('../utils/check_auth');

/* GET admin dashboard */
router.get('/', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let users = await userModel.find({ isDeleted: false });
        res.render('admin', { title: 'Admin Dashboard', users });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/* DELETE user */
router.delete('/users/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let user = await userModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        res.json({ success: true, message: "Xóa người dùng thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;