// controllers/order.js
let orderModel = require('../schemas/order');
let cartModel = require('../schemas/cart');
let productModel = require('../schemas/products');
let { sendmail } = require('../utils/sendmail');

module.exports = {
    // Tạo đơn hàng từ giỏ hàng
    CreateOrder: async function(userId, shippingAddress, deliveryDate) {
        try {
            let cart = await cartModel.findOne({ user: userId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                throw new Error("Giỏ hàng trống");
            }

            // Tính tổng giá
            let totalPrice = 0;
            let items = [];
            for (let item of cart.items) {
                if (item.product.quantity < item.quantity) {
                    throw new Error(`Sản phẩm ${item.product.name} không đủ số lượng`);
                }
                totalPrice += item.product.price * item.quantity;
                items.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                });

                // Cập nhật số lượng sản phẩm trong kho
                await productModel.findByIdAndUpdate(item.product._id, {
                    $inc: { quantity: -item.quantity }
                });
            }

            // Tạo đơn hàng
            let order = new orderModel({
                user: userId,
                items,
                totalPrice,
                shippingAddress,
                deliveryDate
            });

            await order.save();

            // Gửi email xác nhận đơn hàng
            await sendmail(
                user.email,
                "Xác nhận đơn hàng",
                `Đơn hàng của bạn đã được đặt thành công! Tổng giá: ${totalPrice} VND.`
            );

            // Xóa giỏ hàng sau khi đặt hàng
            await cartModel.deleteOne({ user: userId });

            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    // Lấy danh sách đơn hàng của người dùng
    GetOrdersByUser: async function(userId) {
        return await orderModel.find({ user: userId }).populate('items.product');
    },

    // Lấy tất cả đơn hàng (cho admin)
    GetAllOrders: async function() {
        return await orderModel.find().populate('user').populate('items.product');
    },

    // Cập nhật trạng thái đơn hàng (cho admin)
    UpdateOrderStatus: async function(orderId, status) {
        try {
            let order = await orderModel.findById(orderId).populate('user');
            if (!order) {
                throw new Error("Đơn hàng không tồn tại");
            }

            order.status = status;
            await order.save();

            // Gửi email thông báo trạng thái
            await sendmail(
                order.user.email,
                "Cập nhật trạng thái đơn hàng",
                `Đơn hàng của bạn đã được cập nhật thành: ${status}.`
            );

            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    // Hủy đơn hàng (cho khách hàng)
    CancelOrder: async function(orderId, userId) {
        try {
            let order = await orderModel.findOne({ _id: orderId, user: userId });
            if (!order) {
                throw new Error("Đơn hàng không tồn tại");
            }
            if (order.status !== 'pending') {
                throw new Error("Không thể hủy đơn hàng đã được xử lý");
            }

            order.status = 'canceled';
            await order.save();

            // Hoàn lại số lượng sản phẩm trong kho
            for (let item of order.items) {
                await productModel.findByIdAndUpdate(item.product, {
                    $inc: { quantity: item.quantity }
                });
            }

            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};