// controllers/addresses.js
let addressModel = require('../schemas/addresses');

module.exports = {
    // Thêm địa chỉ mới
    AddAddress: async function(userId, address) {
        let newAddress = new addressModel({
            userId,
            address
        });

        // Nếu đây là địa chỉ đầu tiên, đặt làm mặc định
        let existingAddresses = await addressModel.find({ userId });
        if (existingAddresses.length === 0) {
            newAddress.isDefault = true;
        }

        await newAddress.save();
        return newAddress;
    },

    // Lấy danh sách địa chỉ của người dùng
    GetAddresses: async function(userId) {
        return await addressModel.find({ userId });
    },

    // Cập nhật địa chỉ
    UpdateAddress: async function(userId, addressId, address, isDefault) {
        let addr = await addressModel.findOne({ _id: addressId, userId });
        if (!addr) {
            throw new Error('Địa chỉ không tồn tại');
        }

        addr.address = address;
        if (isDefault) {
            // Đặt tất cả địa chỉ khác thành không mặc định
            await addressModel.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
            addr.isDefault = true;
        }

        addr.updatedAt = Date.now();
        await addr.save();
        return addr;
    },

    // Xóa địa chỉ
    DeleteAddress: async function(userId, addressId) {
        let addr = await addressModel.findOne({ _id: addressId, userId });
        if (!addr) {
            throw new Error('Địa chỉ không tồn tại');
        }

        if (addr.isDefault) {
            // Nếu xóa địa chỉ mặc định, đặt địa chỉ khác làm mặc định (nếu có)
            let remainingAddresses = await addressModel.find({ userId, _id: { $ne: addressId } });
            if (remainingAddresses.length > 0) {
                remainingAddresses[0].isDefault = true;
                await remainingAddresses[0].save();
            }
        }

        await addressModel.deleteOne({ _id: addressId, userId });
        return true;
    }
};