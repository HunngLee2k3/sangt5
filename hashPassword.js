const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = 'Hung@973251';
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});