// controllers/products.js
let productModel = require('../schemas/products');

module.exports = {
    GetFeaturedProducts: async function() {
        return await productModel.find({ isFeatured: true, isDeleted: false }).populate('category');
    }
};