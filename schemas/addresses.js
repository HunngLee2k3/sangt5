// schemas/addresses.js
let mongoose = require('mongoose');

let addressSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Phải khớp với tên model trong schemas/users.js
        required: true
    },
    address: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Address', addressSchema); // Tên model là 'Address'