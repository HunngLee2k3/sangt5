// routes/index.js
var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category'); // Import category model

/* GET home page */
router.get('/', async function(req, res, next) {
    try {
        let products = await productModel.find({ isFeatured: true, isDeleted: false }).populate('category');
        let categories = await categoryModel.find({ isDeleted: false }); // Lấy danh sách danh mục
        res.render('index', { 
            title: 'Flower HubHub', 
            products, 
            categories // Truyền categories vào template
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;