// schemas/users.js
let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: { // Thêm trường email (vì route signup có sử dụng)
        type: String,
        required: true,
        unique: true
    },
    role: { // Thêm trường role
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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

module.exports = mongoose.model('User', userSchema);