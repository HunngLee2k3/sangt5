// controllers/order.js
let orderModel = require('../schemas/order'); // Sửa tên file từ 'order' thành 'orders' để khớp với tên file thực tế
let cartModel = require('../schemas/cart');
let productModel = require('../schemas/products');
let { sendmail } = require('../utils/sendmail');

module.exports = {
    CreateOrder: async function(userId, shippingAddress, deliveryDate) {
        try {
            if (!deliveryDate || new Date(deliveryDate) < new Date()) {
                throw new Error("Ngày giao hàng không hợp lệ, phải là ngày trong tương lai");
            }
    
            let cart = await cartModel.findOne({ userId: userId }).populate('items.productId');
            console.log('Cart in CreateOrder:', cart);
            console.log('Cart items in CreateOrder:', cart ? cart.items : null);
    
            if (!cart || !cart.items || cart.items.length === 0) {
                throw new Error("Giỏ hàng trống");
            }
    
            let total = 0;
            let items = [];
            for (let item of cart.items) {
                if (!item.productId) {
                    throw new Error(`Sản phẩm không tồn tại trong giỏ hàng`);
                }
                if (item.productId.quantity < item.quantity) {
                    throw new Error(`Sản phẩm ${item.productId.name} không đủ số lượng`);
                }
                total += item.productId.price * item.quantity;
                items.push({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.productId.price
                });
    
                await productModel.findByIdAndUpdate(item.productId._id, {
                    $inc: { quantity: -item.quantity }
                });
            }
    
            let order = new orderModel({
                userId: userId,
                items,
                total,
                shippingAddress,
                deliveryDate
            });
    
            await order.save();
    
            let userModel = require('../schemas/users');
            let user = await userModel.findById(userId);
            if (!user) {
                throw new Error("Người dùng không tồn tại");
            }
    
            // Gửi email xác nhận đơn hàng (đã comment, giữ nguyên)
            // await sendmail(
            //     user.email,
            //     "Xác nhận đơn hàng",
            //     `Đơn hàng của bạn đã được đặt thành công! Tổng giá: ${total} VND.`
            // );
    
            await cartModel.deleteOne({ userId: userId });
    
            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    GetOrdersByUser: async function(userId) {
        try {
            let orders = await orderModel.find({ userId: userId }).populate({
                path: 'items.productId',
                match: { isDeleted: { $ne: true } }
            });
            orders = orders.filter(order => order.items && order.items.length > 0);
            console.log('Orders found for userId:', userId, orders);
            return orders;
        } catch (error) {
            console.error('Error in GetOrdersByUser:', error);
            throw error;
        }
    },

    // Thêm hàm mới để lấy một đơn hàng cụ thể
    GetOrderById: async function(orderId, userId) {
        try {
            let order = await orderModel.findOne({ _id: orderId, userId: userId }).populate({
                path: 'items.productId',
                match: { isDeleted: { $ne: true } }
            });
            if (!order) {
                throw new Error('Đơn hàng không tồn tại hoặc không thuộc về bạn');
            }
            if (!order.items || order.items.length === 0) {
                throw new Error('Đơn hàng không có sản phẩm hợp lệ');
            }
            console.log('Order found:', order);
            return order;
        } catch (error) {
            console.error('Error in GetOrderById:', error);
            throw error;
        }
    },

    GetAllOrders: async function() {
        return await orderModel.find().populate('user').populate('items.productId');
    },

    UpdateOrderStatus: async function(orderId, status) {
        try {
            let order = await orderModel.findById(orderId).populate('user');
            if (!order) {
                throw new Error("Đơn hàng không tồn tại");
            }
    
            order.status = status;
            await order.save();
    
            // Gửi email (để lại code gốc, nhưng bạn có thể comment nếu không dùng)
            // await sendmail(
            //     order.user.email,
            //     "Cập nhật trạng thái đơn hàng",
            //     `Đơn hàng của bạn đã được cập nhật thành: ${status}.`
            // );
    
            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    CancelOrder: async function(orderId, userId) {
        try {
            let order = await orderModel.findOne({ _id: orderId, userId: userId }).populate('items.productId');
            if (!order) {
                throw new Error("Đơn hàng không tồn tại");
            }
            if (order.status !== 'pending') {
                throw new Error("Không thể hủy đơn hàng đã được xử lý");
            }
    
            order.status = 'cancelled';
            await order.save();
    
            for (let item of order.items) {
                await productModel.findByIdAndUpdate(item.productId, {
                    $inc: { quantity: item.quantity }
                });
            }
    
            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};