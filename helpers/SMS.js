const KEYS = require('../keys');
const twilio = require('twilio')(KEYS.twilioSID, KEYS.twilioToken);

module.exports = (phone, message) => {
	phone = phone.trim();
    if(!phone.startsWith("+1"))
        phone = "+1" + phone;
    if(phone.length !== 11)
        return;

	return twilio.messages.create({
                body: message,
                to: phone,
                from: KEYS.twilioNum
			});
};