const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false,
    auth: {
        user: "eb5f2b0e532ac5",
        pass: "9324359353c91e",
    },
});
module.exports = {
    sendmail: async function (to, subject, URL) {
        return await transporter.sendMail({
            from: 'haigunshipbattle.com',
            to: to,
            subject: subject,
            html: `<a href=${URL}>URL</a>`, // html body
        });
    }
}