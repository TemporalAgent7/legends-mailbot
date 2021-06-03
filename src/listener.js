const { MailListener } = require("mail-listener5");

function startListening(username, password, host, port, mailCallback) {
	const mailListener = new MailListener({
		username,
		password,
		host,
		port,
		tls: true,
		connTimeout: 10000, // Default by node-imap
		authTimeout: 5000, // Default by node-imap,
		tlsOptions: { rejectUnauthorized: false },
		mailbox: "INBOX", // mailbox to monitor
		searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
		markSeen: true, // all fetched email willbe marked as seen and not fetched next time
		fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`
	});

	mailListener.start(); // start listening

	// stop listening
	//mailListener.stop();

	mailListener.on("server:connected", function () {
		console.log("imapConnected");
	});

	mailListener.on("mailbox", function (mailbox) {
		console.log("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
	});

	mailListener.on("server:disconnected", function () {
		console.log("imapDisconnected");
	});

	mailListener.on("error", function (err) {
		console.error(err);
	});

	mailListener.on("mail", function (mail, seqno) {
		mailCallback({
			subject: mail.subject,
			from: mail.from.value[0],
			text: mail.text,
		});
	});
}

module.exports = { startListening };
