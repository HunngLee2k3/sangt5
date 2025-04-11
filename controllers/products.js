// controllers/products.js
let productModel = require('../schemas/products');

module.exports = {
    GetFeaturedProducts: async function() {
        return await productModel.find({ isFeatured: true, isDeleted: false }).populate('category');
    },

    AddProduct: async function({ name, price, quantity, categoryId, description, images }) {
        let product = new productModel({
            name,
            price,
            quantity,
            categoryId,
            description,
            images
        });
        await product.save();
        return product;
    },

    UpdateProduct: async function(id, { name, price, quantity, categoryId, description, images }) {
        let updateData = {
            name,
            price,
            quantity,
            categoryId,
            description,
            updatedAt: Date.now()
        };
        if (images && images.length > 0) {
            updateData.images = images;
        }
        let product = await productModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }
        return product;
    }
};