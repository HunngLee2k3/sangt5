// controllers/cart.js
let cartModel = require('../schemas/cart');
let productModel = require('../schemas/products');

module.exports = {
    AddToCart: async function(userId, productId, quantity) {
        console.log("AddToCart called with:", { userId, productId, quantity });

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            console.error("Product not found:", productId);
            throw new Error("Sản phẩm không tồn tại");
        }

        if (!product.price || product.price <= 0) {
            console.error("Invalid product price:", product.price);
            throw new Error("Giá sản phẩm không hợp lệ");
        }
        if (product.quantity < quantity) {
            console.error("Insufficient product quantity:", { available: product.quantity, requested: quantity });
            throw new Error("Số lượng sản phẩm trong kho không đủ");
        }

        let cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: [],
                totalPrice: 0
            });
        }

        let itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = product.price * cart.items[itemIndex].quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity,
                price: product.price * quantity
            });
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

        try {
            await cart.save();
        } catch (err) {
            console.error("Error saving cart:", err);
            throw new Error("Không thể lưu giỏ hàng");
        }

        return cart;
    },

    GetCartByUser: async function(userId) {
        let cart = await cartModel.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }
        return cart;
    }
};