// routes/addresses.js
var express = require('express');
var router = express.Router();
let addressController = require('../controllers/addresses');

/* GET addresses listing */
router.get('/', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        let addresses = await addressController.GetAddresses(user._id);
        res.render('addresses', { title: 'Your Addresses', addresses });
    } catch (error) {
        next(error);
    }
});

/* POST add address */
router.post('/add', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để thêm địa chỉ");
        }
        let body = req.body;
        await addressController.AddAddress(user._id, body.address);
        res.redirect('/addresses');
    } catch (error) {
        res.render('addresses', { title: 'Your Addresses', error: error.message });
    }
});

/* POST update address */
router.post('/update/:id', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để cập nhật địa chỉ");
        }
        let body = req.body;
        await addressController.UpdateAddress(user._id, req.params.id, body.address, body.isDefault === 'on');
        res.redirect('/addresses');
    } catch (error) {
        res.render('addresses', { title: 'Your Addresses', error: error.message });
    }
});

/* POST delete address */
router.post('/delete/:id', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để xóa địa chỉ");
        }
        await addressController.DeleteAddress(user._id, req.params.id);
        res.redirect('/addresses');
    } catch (error) {
        res.render('addresses', { title: 'Your Addresses', error: error.message });
    }
});

module.exports = router;