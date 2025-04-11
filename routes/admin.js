// routes/admin.js
var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');
let orderModel = require('../schemas/order');
let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category');
let { check_authentication, check_authorization } = require('../utils/check_auth');
const upload = require('../utils/multer');

/* GET admin dashboard */
router.get('/', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let users = await userModel.find({ role: 'user' });
        res.render('admin', { title: 'Admin Dashboard', user: req.user, users });
    } catch (error) {
        res.render('admin', { title: 'Admin Dashboard', user: req.user, error: error.message });
    }
});

/* GET user orders */
router.get('/users/:id/orders', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let user = await userModel.findById(req.params.id);
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        let orders = await orderModel.find({ userId: req.params.id }).populate({
            path: 'items.productId',
            match: { isDeleted: { $ne: true } }
        });
        orders = orders.filter(order => order.items && order.items.length > 0);
        res.render('admin-user-orders', { title: `Đơn hàng của ${user.username}`, user: req.user, orders, selectedUser: user });
    } catch (error) {
        res.render('admin-user-orders', { title: 'Đơn hàng', user: req.user, error: error.message });
    }
});

/* DELETE user */
router.delete('/users/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let user = await userModel.findById(req.params.id);
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        if (user.role === 'admin') {
            throw new Error("Không thể xóa tài khoản admin");
        }
        await userModel.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: "Xóa người dùng thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/* GET products list */
router.get('/products', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let products = await productModel.find().populate('category');
        res.render('admin-products', { title: 'Quản lý sản phẩm', user: req.user, products });
    } catch (error) {
        res.render('admin-products', { title: 'Quản lý sản phẩm', user: req.user, error: error.message });
    }
});

/* GET add product form */
router.get('/products/add', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let categories = await categoryModel.find();
        res.render('addProduct', { title: 'Thêm sản phẩm', user: req.user, categories });
    } catch (error) {
        res.render('addProduct', { title: 'Thêm sản phẩm', user: req.user, error: error.message });
    }
});

/* POST add product */
router.post('/products/add', check_authentication, check_authorization('admin'), upload.array('images', 5), async function(req, res, next) {
    try {
        let { name, price, quantity, categoryId, description } = req.body;
        // Sửa logic xử lý đường dẫn ảnh
        let images = req.files ? req.files.map(file => {
            // Chuyển đổi dấu \ thành / và loại bỏ phần public
            let relativePath = file.path.replace(/\\/g, '/').replace(/^public\//, '');
            return `/${relativePath}`;
        }) : [];

        // Kiểm tra categoryId có tồn tại và hợp lệ không
        if (!categoryId) {
            throw new Error("Vui lòng chọn danh mục cho sản phẩm");
        }
        const categoryExists = await categoryModel.findById(categoryId);
        if (!categoryExists) {
            throw new Error("Danh mục không tồn tại");
        }

        let product = new productModel({
            name,
            price,
            quantity,
            category: categoryId,
            description,
            images
        });
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        let categories = await categoryModel.find();
        res.render('addProduct', { title: 'Thêm sản phẩm', user: req.user, categories, error: error.message });
    }
});

/* GET edit product form */
router.get('/products/edit/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }
        let categories = await categoryModel.find();
        product.categoryId = product.category;
        res.render('addProduct', { title: 'Sửa sản phẩm', user: req.user, product, categories });
    } catch (error) {
        res.render('addProduct', { title: 'Sửa sản phẩm', user: req.user, error: error.message });
    }
});

/* POST edit product */
router.post('/products/edit/:id', check_authentication, check_authorization('admin'), upload.array('images', 5), async function(req, res, next) {
    try {
        let { name, price, quantity, categoryId, description } = req.body;
        // Sửa logic xử lý đường dẫn ảnh
        let images = req.files ? req.files.map(file => {
            // Chuyển đổi dấu \ thành / và loại bỏ phần public
            let relativePath = file.path.replace(/\\/g, '/').replace(/^public\//, '');
            return `/${relativePath}`;
        }) : [];

        // Kiểm tra categoryId có tồn tại và hợp lệ không
        if (!categoryId) {
            throw new Error("Vui lòng chọn danh mục cho sản phẩm");
        }
        const categoryExists = await categoryModel.findById(categoryId);
        if (!categoryExists) {
            throw new Error("Danh mục không tồn tại");
        }

        let updateData = {
            name,
            price,
            quantity,
            category: categoryId,
            description,
            updatedAt: Date.now()
        };
        if (images.length > 0) {
            updateData.images = images;
        }
        let product = await productModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }
        res.redirect('/admin/products');
    } catch (error) {
        let categories = await categoryModel.find();
        res.render('addProduct', { title: 'Sửa sản phẩm', user: req.user, product: req.body, categories, error: error.message });
    }
});

/* DELETE product */
router.delete('/products/delete/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }
        res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/* GET categories list */
router.get('/categories', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let categories = await categoryModel.find();
        res.render('admin-categories', { title: 'Quản lý danh mục', user: req.user, categories });
    } catch (error) {
        res.render('admin-categories', { title: 'Quản lý danh mục', user: req.user, error: error.message });
    }
});

/* GET add category form */
router.get('/categories/add', check_authentication, check_authorization('admin'), async function(req, res, next) {
    res.render('addCategory', { title: 'Thêm danh mục', user: req.user });
});

/* POST add category */
router.post('/categories/add', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let { name, description } = req.body;
        let category = new categoryModel({
            name,
            description
        });
        await category.save();
        res.redirect('/admin/categories');
    } catch (error) {
        res.render('addCategory', { title: 'Thêm danh mục', user: req.user, error: error.message });
    }
});

/* GET edit category form */
router.get('/categories/edit/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let category = await categoryModel.findById(req.params.id);
        if (!category) {
            throw new Error("Danh mục không tồn tại");
        }
        res.render('addCategory', { title: 'Sửa danh mục', user: req.user, category });
    } catch (error) {
        res.render('addCategory', { title: 'Sửa danh mục', user: req.user, error: error.message });
    }
});

/* POST edit category */
router.post('/categories/edit/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let { name, description } = req.body;
        let category = await categoryModel.findByIdAndUpdate(req.params.id, {
            name,
            description,
            updatedAt: Date.now()
        }, { new: true });
        if (!category) {
            throw new Error("Danh mục không tồn tại");
        }
        res.redirect('/admin/categories');
    } catch (error) {
        res.render('addCategory', { title: 'Sửa danh mục', user: req.user, category: req.body, error: error.message });
    }
});

/* DELETE category */
router.delete('/categories/delete/:id', check_authentication, check_authorization('admin'), async function(req, res, next) {
    try {
        let category = await categoryModel.findById(req.params.id);
        if (!category) {
            throw new Error("Danh mục không tồn tại");
        }
        let products = await productModel.find({ category: req.params.id });
        if (products.length > 0) {
            throw new Error("Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này");
        }
        await categoryModel.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: "Xóa danh mục thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;