// routes/orders.js
var express = require('express');
var router = express.Router();
let orderController = require('../controllers/order');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let { CreateSuccessRes, CreateErrorRes } = require('../utils/responseHandler');
let constants = require('../utils/constants');

// Hiển thị giao diện checkout
router.get('/create', check_authentication, async function(req, res, next) {
    res.render('checkout', { title: 'Checkout' });
});

// Hiển thị giao diện lịch sử đơn hàng
router.get('/', check_authentication, async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        let orders = await orderController.GetOrdersByUser(user._id);
        res.render('orders', { title: 'Đơn hàng của bạn', orders });
    } catch (error) {
        next(error);
    }
});

// Hiển thị giao diện lịch sử đơn hàng (giữ lại /view để tương thích)
router.get('/view', check_authentication, async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        let orders = await orderController.GetOrdersByUser(req.user._id);
        res.render('orders', { title: 'Đơn hàng của bạn', orders });
    } catch (error) {
        next(error);
    }
});

/* GET order detail page */
router.get('/:id', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        let order = await orderController.GetOrderById(req.params.id, user._id);
        res.render('order-detail', { title: 'Chi tiết đơn hàng', order });
    } catch (error) {
        console.error('Error in GET /orders/:id:', error);
        res.render('order-detail', { title: 'Chi tiết đơn hàng', error: error.message });
    }
});

// Tạo đơn hàng
router.post('/create', check_authentication, async function(req, res, next) {
    try {
        let { shippingAddress, deliveryDate } = req.body;
        let order = await orderController.CreateOrder(req.user._id, shippingAddress, new Date(deliveryDate));
        res.redirect('/orders/view');
    } catch (error) {
        next(error);
    }
});

// Lấy tất cả đơn hàng (cho admin)
router.get('/all', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res, next) {
    try {
        let orders = await orderController.GetAllOrders();
        CreateSuccessRes(res, orders, 200);
    } catch (error) {
        next(error);
    }
});

// Cập nhật trạng thái đơn hàng (cho admin)
router.put('/:orderId/status', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res, next) {
    try {
        let { status } = req.body;
        let order = await orderController.UpdateOrderStatus(req.params.orderId, status);
        CreateSuccessRes(res, order, 200);
    } catch (error) {
        next(error);
    }
});

// Hủy đơn hàng (cho khách hàng)
// routes/orders.js
router.post('/:orderId/cancel', check_authentication, async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        await orderController.CancelOrder(req.params.orderId, user._id);
        res.redirect('/orders'); // Làm mới trang danh sách đơn hàng
    } catch (error) {
        console.error('Error in POST /orders/:orderId/cancel:', error);
        let orders = await orderController.GetOrdersByUser(user._id);
        res.render('orders', { title: 'Đơn hàng của bạn', orders, error: error.message });
    }
});

module.exports = router;