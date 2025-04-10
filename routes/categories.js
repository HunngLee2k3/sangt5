var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
let { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
let slug = require('slugify');

/* API: Lấy danh sách danh mục */
router.get('/', async function (req, res, next) {
  try {
    let categories = await categoryModel.find({ isDeleted: false });
    CreateSuccessRes(res, categories, 200);
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị danh sách danh mục */
router.get('/view', async function (req, res, next) {
  try {
    let categories = await categoryModel.find({ isDeleted: false });
    res.render('categories', { title: 'Category List', categories });
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị form thêm danh mục */
router.get('/add', function (req, res, next) {
  res.render('addCategory', { title: 'Add Category' });
});

/* API: Thêm danh mục mới */
router.post('/', async function (req, res, next) {
  try {
    let body = req.body;
    let newCategory = new categoryModel({
      name: body.name,
      description: body.description,
      slug: slug(body.name, { lower: true }),
    });
    await newCategory.save();
    CreateSuccessRes(res, newCategory, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;