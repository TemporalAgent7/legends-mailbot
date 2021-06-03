const zlib = require("zlib");

function attemptDecode(b64Data) {
	try {
		let data = Buffer.from(b64Data, "base64");
		let decoded = zlib.inflateRawSync(data);
		return JSON.parse(decoded.toString());
	} catch {
		return undefined;
	}
}

module.exports = { attemptDecode };
