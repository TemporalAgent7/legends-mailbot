const { startListening } = require("./listener");
const { attemptDecode } = require("./parser");
const { sendEmail } = require("./sender");

const crypto = require('crypto');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

function generateHash(address) {
	//return uuidv4();
	return crypto.createHash('md5').update(address).digest('hex');
}

startListening(
	process.env.EMAIL_USERNAME,
	process.env.EMAIL_PASSWORD,
	process.env.EMAIL_IMAP_HOST,
	process.env.EMAIL_IMAP_PORT,
	(mail) => {
		if (mail.text.indexOf("Do not modify anything below here") >= 0) {
			// Worth trying to process
			let data = mail.text.substr(mail.text.indexOf("data:") + 6);

			if (data.indexOf('\n') > 0) {
				data = data.substr(0, data.indexOf('\n'));
			}

			let playerData = attemptDecode(data);

			if (playerData) {
				let captainName = mail.subject;
				if (captainName == "Star Trek Support") {
					captainName = "Captain";
				}

				let cloudSaveId = generateHash(mail.from.address);

				// Clean up the data for sharing
				let dataToShare = {
					captainName,
					accessories: playerData.accessories,
					gears: playerData.gears,
					units: playerData.units,
					last_level_rewarded: playerData.last_level_rewarded,
					missions: playerData.missions,
					cloudSaveId
				};

				if (mail.text.indexOf("full") >= 0) {
					// Include the items as well
					dataToShare.items = playerData.items;
				}

				fetch(`https://apilegends.datacore.app/post_profile`, {
					method: 'post',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(dataToShare)
				}).then(() => {
					sendEmail(
						process.env.EMAIL_USERNAME,
						process.env.EMAIL_PASSWORD,
						process.env.EMAIL_SMTP_HOST,
						process.env.EMAIL_SMTP_PORT,
						mail.subject,
						mail.from.address,
						cloudSaveId);

					console.log(`Email sent`, mail.subject, mail.from, cloudSaveId);
				});
			}
		}
	}
);
