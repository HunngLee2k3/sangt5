// routes/products.js
var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
let slug = require('slugify');
let multer = require('multer');
let path = require('path');

let productImageDir = path.join(__dirname, '../product_images');
let urlProductImage = `http://localhost:3000/product_images/`;

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, productImageDir),
    filename: (req, file, cb) => cb(null, (new Date(Date.now())).getTime() + '-' + file.originalname)
});

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image/)) {
            cb(new Error("Chỉ nhận file ảnh"));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

/* Giao diện: Hiển thị danh sách sản phẩm */
router.get('/view', async function(req, res, next) {
    try {
        let products = await productModel.find({ isDeleted: false }).populate('category');
        res.render('products', { title: 'Product List', products });
    } catch (error) {
        next(error);
    }
});

/* Giao diện: Hiển thị form thêm sản phẩm */
router.get('/add', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let categories = await categoryModel.find({ isDeleted: false });
        res.render('addProduct', { title: 'Add Product', categories });
    } catch (error) {
        res.render('addProduct', { title: 'Add Product', error: error.message });
    }
});

/* API: Lấy danh sách sản phẩm */
router.get('/', async function(req, res, next) {
    try {
        let products = await productModel.find({ isDeleted: false }).populate('category');
        CreateSuccessRes(res, products, 200);
    } catch (error) {
        next(error);
    }
});

/* API: Lấy chi tiết sản phẩm theo ID */
router.get('/:slug', async function(req, res, next) {
    try {
        let product = await productModel.findOne({ slug: req.params.slug, isDeleted: false }).populate('category');
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        console.log('Product:', product);
        res.render('product', { title: product.name, product });
    } catch (error) {
        next(error);
    }
});

/* API: Thêm sản phẩm mới */
router.post('/', check_authentication, check_authorization('admin'), upload.array('images', 5), async function(req, res, next) {
    try {
        let body = req.body;

        let category = await categoryModel.findById(body.category);
        if (!category) {
            return res.render('addProduct', {
                title: 'Add Product',
                error: 'Danh mục không tồn tại',
                categories: await categoryModel.find({ isDeleted: false }),
            });
        }

        let images = req.files ? req.files.map(file => path.join(urlProductImage, file.filename)) : [];

        let newProduct = new productModel({
            name: body.name,
            price: body.price,
            quantity: body.quantity,
            description: body.description,
            images: images,
            category: category._id,
            slug: slug(body.name, { lower: true }),
            isFeatured: body.isFeatured === 'on'
        });

        await newProduct.save();
        res.redirect('/products/view');
    } catch (error) {
        res.render('addProduct', {
            title: 'Add Product',
            error: error.message,
            categories: await categoryModel.find({ isDeleted: false }),
        });
    }
});

/* Phục vụ file ảnh sản phẩm */
router.get('/product_images/:filename', function(req, res, next) {
    let pathFile = path.join(productImageDir, req.params.filename);
    res.sendFile(pathFile);
});

module.exports = router;