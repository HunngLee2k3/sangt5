var express = require('express');
var router = express.Router();
var menuSchema = require('../schemas/menu')
let slug = require('slugify')


/* GET home page. */
router.get('/', async function (req, res, next) {
  let all = await menuSchema.find({
  })
  let parents = [];
  for (const menu of all) {
    if (!menu.parent) {
      let children = [];
      for (const menuchild of all) {
        let childrenQ = await menuSchema.find({
          parent: menu._id
        })
        children = childrenQ.map(c => ({
          text: c.text,
          URL: c.URL
        }))

      }
      parents.push({
        text: menu.text,
        URL: menu.URL,
        children: children
      })
    }
  }
  res.send(parents)
});
router.post('/', async function (req, res, next) {
  let itemMenu = {
    text: req.body.text,
    URL: `/${slug(req.body.text, { lower: true })}`,
  }
  if (req.body.parent) {
    let parentItem = await menuSchema.findOne({
      text: req.body.parent
    })
    itemMenu.parent = parentItem._id;
  }
  let newMenu = new menuSchema(itemMenu)
  await newMenu.save();
  res.send(newMenu)
});

module.exports = router;
