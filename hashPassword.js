const bcrypt = require('bcrypt');

const password = 'Hung@973251'; // Mật khẩu bạn muốn dùng cho admin
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Lỗi khi hash mật khẩu:', err);
    } else {
        console.log('Mật khẩu đã hash:', hash);
    }
});