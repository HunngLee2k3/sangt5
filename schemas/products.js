// schemas/products.js
let mongoose = require('mongoose');
let slugify = require('slugify');

let productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Phải khớp với tên model trong schemas/categories.js
        required: true
    },
    description: {
        type: String
    },
    images: [{
        type: String
    }],
    slug: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Product', productSchema); // Tên model là 'Product'