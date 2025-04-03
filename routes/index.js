var express = require('express');
var router = express.Router();
var categorySchema = require('../schemas/category')
var productSchema = require('../schemas/products')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get("/slug/:category", async function (req, res, next) {
  let categorySlug = req.params.category;
  //let productSlug = req.params.product;
  let category = await categorySchema.findOne({
    slug: categorySlug
  })
  if (category) {
    let products = await productSchema.find({
      category: category._id
    })
    res.status(200).send(products)
  }

})
router.get("/slug/:category/:product", async function (req, res, next) {
  let categorySlug = req.params.category;
  let productSlug = req.params.product;
  console.log(productSlug);
  let category = await categorySchema.findOne({
    slug: categorySlug
  })
  if (category) {
    let products = await productSchema.find({
      category: category._id,
      slug:productSlug
    })
    res.status(200).send(products)
  }
})

module.exports = router;
