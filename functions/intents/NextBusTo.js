const lib = require('lib');
const gmapi = require('@google/maps').createClient({
	key: process.env.gmapiKey
});

const loc = require('../../helpers/Location');
const resp = require('../../helpers/AlexaResponse');

/**
* Gives a next bus to a location using GMAPI
* @param {object} request Alexa request object
* @returns {object}
*/
module.exports = (request, callback) => {
	loc(request.context.System.device.deviceId, request.context.apiAccessToken, (result) => {
		if(typeof result == "string") { //real location!

		}else { //bad, try authenticating
			
		}
	});
	if(destination) {
		
	}else {
		return callback(null, "Sorry, I need a destination to do that!");
	}

	var speech = `The next bus to ${destination} is the ${route} from ${stop} at ${time}.`;
	return callback(null, build);

};
