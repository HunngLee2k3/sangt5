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
/* GET orders page */
router.get('/', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        let orders = await orderModel.find({ userId: user._id }).populate('items.productId');
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
        let order = await orderModel.findOne({ _id: req.params.id, userId: user._id }).populate('items.productId');
        if (!order) {
            throw new Error("Đơn hàng không tồn tại hoặc không thuộc về bạn");
        }
        res.render('order-detail', { title: 'Chi tiết đơn hàng', order });
    } catch (error) {
        next(error);
    }
});
// Tạo đơn hàng
router.post('/create', check_authentication, async function(req, res, next) {
    try {
        let { shippingAddress, deliveryDate } = req.body;
        let order = await orderController.CreateOrder(req.user._id, shippingAddress, new Date(deliveryDate));
        res.redirect('/orders/view'); // Chuyển hướng đến lịch sử đơn hàng
    } catch (error) {
        next(error);
    }
});

// // Lấy danh sách đơn hàng của người dùng (API)
// router.get('/', check_authentication, async function(req, res, next) {
//     try {
//         let orders = await orderController.GetOrdersByUser(req.user._id);
//         CreateSuccessRes(res, orders, 200);
//     } catch (error) {
//         next(error);
//     }
// });

// Hiển thị giao diện lịch sử đơn hàng
router.get('/view', check_authentication, async function(req, res, next) {
    try {
        let orders = await orderController.GetOrdersByUser(req.user._id);
        res.render('orders', { title: 'Your Orders', orders });
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
router.put('/:orderId/cancel', check_authentication, async function(req, res, next) {
    try {
        let order = await orderController.CancelOrder(req.params.orderId, req.user._id);
        CreateSuccessRes(res, order, 200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;