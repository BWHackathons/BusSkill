var AWS = require('aws-sdk');
const KEYS = require('../keys')

AWS.config.update({
	accessKeyId: KEYS.awsAccess,
	secretAccessKey: KEYS.awsSecret,
	region: 'us-east-1'
	});

module.exports = (phone, message) => {
	
	return new Promise(
		(resolve, reject) => {
			var sns = new AWS.SNS();
			sns.publish({
					Message: message,
					PhoneNumber: phone
				}, function (err, data) {
					if (err) {
						console.log(err.stack);
						reject();
					return;
				}
				console.log("Message Sent");
				resolve();
			});
		});
}