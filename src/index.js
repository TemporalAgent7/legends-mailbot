const { startListening } = require("./listener");
const { attemptDecode } = require("./parser");
const { sendEmail } = require("./sender");

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

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

				let cloudSaveId = uuidv4();

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
