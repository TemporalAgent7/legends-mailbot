const nodemailer = require("nodemailer");

function sendEmail(username, password, host, port, subject, address, sharedId) {
	let transporter = nodemailer.createTransport({
		host,
		port,
		secure: port == 465,
		auth: {
			user: username,
			pass: password
		},
	});

	return await transporter.sendMail({
		from: '"Legendist Bot" <legends@datacore.app>',
		to: address,
		subject: "RE: " + subject,
		text: `Your profile was succesfully uploaded: https://legends.datacore.app/view?id=${sharedId}`
	});
}

module.exports = { sendEmail };