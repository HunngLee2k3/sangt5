// routes/index.js
var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category');

router.get('/', async function(req, res, next) {
    try {
        // Truy vấn sản phẩm nổi bật
        let products = await productModel.find({ isFeatured: true, isDeleted: false }).populate('category');
        
        // Nếu không có sản phẩm nổi bật, lấy tất cả sản phẩm (hoặc một số sản phẩm bất kỳ)
        if (!products || products.length === 0) {
            products = await productModel.find({ isDeleted: false }).populate('category').limit(6);
        }

        // Log để kiểm tra dữ liệu
        console.log('Products:', products);

        let categories = await categoryModel.find({ isDeleted: false });
        console.log('Categories:', categories);

        res.render('index', { 
            title: 'Flower HubHub', 
            products, 
            categories,
            isAuthenticated: req.isAuthenticated || false, // Truyền trạng thái đăng nhập
            user: req.user || null, // Truyền thông tin user
            cartCount: req.cartCount || 0 // Truyền số lượng sản phẩm trong giỏ hàng (nếu có)
        });
    } catch (error) {
        console.error('Error in route /:', error);
        next(error);
    }
});

module.exports = router;