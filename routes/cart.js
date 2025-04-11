// routes/cart.js
var express = require('express');
let cartModel = require('../schemas/cart');
let addressModel = require('../schemas/addresses');
var router = express.Router();
let cartController = require('../controllers/cart');
let orderController = require('../controllers/order');
let { CreateSuccessRes, CreateErrorRes } = require('../utils/responseHandler');
let productModel = require('../schemas/products');

/* POST add product to cart */
router.post('/add', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
        }
        let body = req.body;
        console.log('User in /cart/add:', user);
        console.log('Product ID to add:', body.productId);
        let cart = await cartModel.findOne({ userId: user._id });
        console.log('Cart before adding:', cart);
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
        console.log('Cart after adding:', cart);
        res.json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng' });
    } catch (error) {
        console.log('Error in /cart/add:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/* GET cart view */
router.get('/view', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }
        console.log('User in /cart/view:', user);
        let cart = await cartModel.findOne({ userId: user._id }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });
        console.log('Cart in /cart/view:', cart);
        if (!cart) {
            cart = { items: [] };
        } else {
            cart.items = cart.items.filter(item => item.productId != null);
            await cart.save();
            console.log('Cart after filtering:', cart);
        }
        res.render('cart', { title: 'Giỏ hàng của bạn', cart });
    } catch (error) {
        console.log('Error in /cart/view:', error);
        next(error);
    }
});

/* GET cart count */
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

/* POST checkout */
router.post('/checkout', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            throw new Error("Bạn cần đăng nhập để đặt hàng");
        }
        let cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        console.log('Cart in POST /cart/checkout:', cart);
        console.log('Cart items in POST /cart/checkout:', cart ? cart.items : null);

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
        let deliveryDate = new Date(body.deliveryDate);
        if (isNaN(deliveryDate.getTime()) || deliveryDate < new Date()) {
            throw new Error("Ngày giao hàng không hợp lệ, phải là ngày trong tương lai");
        }
        let order = await orderController.CreateOrder(user._id, address.address, deliveryDate);
        res.redirect('/orders');
    } catch (error) {
        try {
            if (!req.user) {
                return res.redirect('/auth/login');
            }
            let cart = await cartModel.findOne({ userId: req.user._id }).populate('items.productId');
            let total = cart ? cart.items.reduce((sum, item) => sum + (item.productId && item.productId.price ? item.productId.price * item.quantity : 0), 0) : 0;
            let addresses = await addressModel.find({ userId: req.user._id });
            res.render('checkout', { title: 'Thanh toán', cart, total, addresses, error: error.message });
        } catch (renderError) {
            next(renderError);
        }
    }
});

/* GET checkout */
router.get('/checkout', async function(req, res, next) {
    try {
        let user = req.user;
        if (!user) {
            return res.redirect('/auth/login');
        }

        let cart = await cartModel.findOne({ userId: user._id }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        });

        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart');
        }

        let total = cart.items.reduce((sum, item) => {
            return sum + (item.productId && item.productId.price ? item.productId.price * item.quantity : 0);
        }, 0);

        let addresses = await addressModel.find({ userId: user._id });
        console.log('Addresses in /cart/checkout:', addresses);

        res.render('checkout', { title: 'Thanh toán', cart, total, addresses });
    } catch (error) {
        console.error('Error in /cart/checkout:', error);
        next(error);
    }
});

/* POST remove item from cart */
router.post('/remove/:itemId', async function(req, res, next) {
    try {
        console.log('Request to remove item:', req.params.itemId);
        let user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: "Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng" });
            return;
        }
        let cart = await cartModel.findOne({ userId: user._id });
        if (!cart) {
            res.status(400).json({ success: false, message: "Giỏ hàng không tồn tại" });
            return;
        }
        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        cart.updatedAt = Date.now();
        await cart.save();
        console.log('Cart after removing item:', cart);
        res.json({ success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
    } catch (error) {
        console.log('Error in /cart/remove:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/* POST update item quantity */
router.post('/update/:itemId', async function(req, res, next) {
    try {
        console.log('Request to update quantity:', req.params.itemId, req.body);
        let user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: "Bạn cần đăng nhập để cập nhật giỏ hàng" });
            return;
        }
        let { quantity } = req.body;
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity <= 0) {
            res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
            return;
        }

        let cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        if (!cart) {
            res.status(400).json({ success: false, message: "Giỏ hàng không tồn tại" });
            return;
        }

        let item = cart.items.find(item => item._id.toString() === req.params.itemId);
        if (!item) {
            res.status(400).json({ success: false, message: "Sản phẩm không tồn tại trong giỏ hàng" });
            return;
        }

        let product = await productModel.findById(item.productId._id);
        if (!product) {
            res.status(400).json({ success: false, message: "Sản phẩm không tồn tại" });
            return;
        }
        if (quantity > product.quantity) {
            res.status(400).json({ success: false, message: `Số lượng vượt quá tồn kho (${product.quantity} sản phẩm còn lại)` });
            return;
        }

        item.quantity = quantity;
        cart.updatedAt = Date.now();
        await cart.save();
        console.log('Cart after updating quantity:', cart);
        res.json({ success: true, message: "Cập nhật số lượng thành công" });
    } catch (error) {
        console.log('Error in /cart/update:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;