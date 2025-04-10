// routes/cart.js
var express = require('express');
let cartModel = require('../schemas/cart');
var router = express.Router();
let cartController = require('../controllers/cart');
let { CreateSuccessRes, CreateErrorRes } = require('../utils/responseHandler');
let productModel = require('../schemas/products'); // Thêm dòng này
/* POST add product to cart */
router.post('/add', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
        }
        let body = req.body;
        console.log('User in /cart/add:', user); // Log user
        console.log('Product ID to add:', body.productId); // Log productId
        let cart = await cartModel.findOne({ userId: user._id });
        console.log('Cart before adding:', cart); // Log cart trước khi thêm
        if (!cart) {
            cart = new cartModel({ userId: user._id, items: [] });
        }
        let itemIndex = cart.items.findIndex(item => item.productId.toString() === body.productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += body.quantity || 1;
        } else {
            cart.items.push({ productId: body.productId, quantity: body.quantity || 1 });
        }
        cart.updatedAt = Date.now();
        await cart.save();
        console.log('Cart after adding:', cart); // Log cart sau khi thêm
        res.json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng' });
    } catch (error) {
        console.log('Error in /cart/add:', error); // Log lỗi
        res.status(400).json({ success: false, message: error.message });
    }
});

// routes/cart.js
router.get('/view', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        console.log('User in /cart/view:', user); // Log user
        let cart = await cartModel.findOne({ userId: user._id }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });
        console.log('Cart in /cart/view:', cart); // Log cart
        if (!cart) {
            cart = { items: [] };
        } else {
            // Xóa các item có productId không hợp lệ
            cart.items = cart.items.filter(item => item.productId != null);
            await cart.save();
            console.log('Cart after filtering:', cart); // Log cart sau khi lọc
        }
        res.render('cart', { title: 'Giỏ hàng của bạn', cart });
    } catch (error) {
        console.log('Error in /cart/view:', error); // Log lỗi
        next(error);
    }
});
// routes/cart.js (thêm route GET /cart/count)
router.get('/count', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.status(200).json({ success: true, count: 0 });
        }
        let cart = await cartModel.findOne({ userId: user._id });
        let count = cart ? cart.items.length : 0;
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// routes/cart.js
router.post('/checkout', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để đặt hàng");
        }
        let cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new Error("Giỏ hàng trống, không thể đặt hàng");
        }
        let body = req.body;
        if (!body.addressId) {
            throw new Error("Vui lòng chọn địa chỉ giao hàng");
        }
        let address = await addressModel.findOne({ _id: body.addressId, userId: user._id });
        if (!address) {
            throw new Error("Địa chỉ không tồn tại");
        }
        let order = await orderController.CreateOrder(user._id, address.address);
        res.redirect('/orders');
    } catch (error) {
        let cart = await cartModel.findOne({ userId: req.user._id }).populate('items.productId');
        let total = cart ? cart.items.reduce((sum, item) => sum + (item.productId && item.productId.price ? item.productId.price * item.quantity : 0), 0) : 0;
        let addresses = await addressModel.find({ userId: req.user._id });
        res.render('checkout', { title: 'Thanh toán', cart, total, addresses, error: error.message });
    }
});
// routes/cart.js
router.post('/checkout', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để đặt hàng");
        }
        let cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new Error("Giỏ hàng trống, không thể đặt hàng");
        }
        let body = req.body;
        if (!body.addressId) {
            throw new Error("Vui lòng chọn địa chỉ giao hàng");
        }
        let address = await addressModel.findOne({ _id: body.addressId, userId: user._id });
        if (!address) {
            throw new Error("Địa chỉ không tồn tại");
        }
        let order = await orderController.CreateOrder(user._id, address.address);
        res.redirect('/orders');
    } catch (error) {
        try {
            // Kiểm tra lại user trước khi truy vấn
            if (!req.user) {
                return res.redirect('/auth/login');
            }
            let cart = await cartModel.findOne({ userId: req.user._id }).populate('items.productId');
            let total = cart ? cart.items.reduce((sum, item) => sum + (item.productId && item.productId.price ? item.productId.price * item.quantity : 0), 0) : 0;
            let addresses = await addressModel.find({ userId: req.user._id });
            res.render('checkout', { title: 'Thanh toán', cart, total, addresses, error: error.message });
        } catch (renderError) {
            // Nếu có lỗi trong khối catch, chuyển đến middleware xử lý lỗi
            next(renderError);
        }
    }
});
// routes/cart.js
router.get('/checkout', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
        }

        let cart = await cartModel.findOne({ userId: user._id }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart'); // Chuyển hướng đến giỏ hàng nếu giỏ hàng trống
        }

        res.render('checkout', { title: 'Thanh toán', cart });
    } catch (error) {
        console.error('Error in /cart/checkout:', error);
        next(error); // Chuyển lỗi đến middleware xử lý lỗi
    }
});
// routes/cart.js
router.post('/remove-by-index', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng");
        }
        let body = req.body;
        let index = parseInt(body.index);
        if (isNaN(index)) {
            throw new Error("Chỉ số không hợp lệ");
        }
        let cart = await cartModel.findOne({ userId: user._id });
        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại');
        }
        if (index < 0 || index >= cart.items.length) {
            throw new Error("Chỉ số không hợp lệ");
        }
        cart.items.splice(index, 1); // Xóa item tại chỉ số
        await cart.save();
        CreateSuccessRes(res, cart, 200);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
module.exports = router;