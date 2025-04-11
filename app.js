// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// Import tất cả các model và thêm log
try {
    console.log('Registering User model...');
    require('./schemas/users');
    console.log('Registering Product model...');
    require('./schemas/products');
    console.log('Registering Category model...');
    require('./schemas/category');
    console.log('Registering Cart model...');
    require('./schemas/cart');
    console.log('Registering Address model...');
    require('./schemas/addresses');
    console.log('Registering Order model...');
    require('./schemas/order');
    console.log('All models registered successfully');
} catch (error) {
    console.error('Error registering models:', error);
    process.exit(1);
}

var indexRouter = require('./routes/index');
var productsRouter = require('./routes/products');
var cartRouter = require('./routes/cart');
var ordersRouter = require('./routes/orders');
var authRouter = require('./routes/auth');
var addressesRouter = require('./routes/addresses');
var adminRouter = require('./routes/admin');
var { check_authentication } = require('./utils/check_auth');

var app = express();

// Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/S5");
mongoose.connection.on('connected', () => {
    console.log("Connected to MongoDB");
});
mongoose.connection.on('error', (err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('your-secret-key'));
app.use(express.static(path.join(__dirname, 'public'))); // Đảm bảo dòng này có mặt

// Middleware kiểm tra đăng nhập
app.use(check_authentication);

app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/auth', authRouter);
app.use('/addresses', addressesRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;