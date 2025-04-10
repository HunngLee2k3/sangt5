// controllers/users.js
let userModel = require('../schemas/users');
let bcrypt = require('bcrypt');

module.exports = {
    // Kiểm tra đăng nhập
    CheckLogin: async function(username, password) {
        console.log("Đang tìm người dùng với username:", username);
        let user = await userModel.findOne({ username, isDeleted: false });
        console.log("Người dùng tìm thấy:", user);
        if (!user) {
            throw new Error("Tên người dùng không tồn tại");
        }
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng");
        }
        return user._id;
    },

    // Tạo người dùng mới
    CreateAnUser: async function(username, password, email, role) {
        let existingUser = await userModel.findOne({ $or: [{ username }, { email }], isDeleted: false });
        if (existingUser) {
            throw new Error("Tên người dùng hoặc email đã tồn tại");
        }
        let newUser = new userModel({
            username,
            password,
            email,
            role
        });
        await newUser.save();
        return newUser;
    },

    // Lấy người dùng theo email
    GetUserByEmail: async function(email) {
        return await userModel.findOne({ email, isDeleted: false });
    },

    // Lấy người dùng theo token đặt lại mật khẩu
    GetUserByToken: async function(token) {
        let user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExp: { $gt: Date.now() },
            isDeleted: false
        });
        if (!user) {
            throw new Error("Token không hợp lệ hoặc đã hết hạn");
        }
        return user;
    },

    // Thay đổi mật khẩu
    ChangePassword: async function(user, oldpassword, newpassword) {
        let isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu cũ không đúng");
        }
        user.password = newpassword;
        await user.save();
        return true;
    }
};