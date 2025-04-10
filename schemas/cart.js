// schemas/cart.js
let mongoose = require('mongoose');

let cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Phải khớp với tên model trong schemas/users.js
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Phải khớp với tên model trong schemas/products.js
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema); // Tên model là 'Cart'