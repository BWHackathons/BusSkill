const lib = require('lib');
const gmapi = requrire('@google/maps').createClient({
	key: process.env.gmapiKey
});

const loc = require('../../helpers/Location');
const resp = require('../../helpers/AlexaResponse');

/**
* Gives a next bus to a location using GMAPI
* @param {string} destination user's destination
* @param {string} deviceId    user's Echo device ID
* @param {string} apiAccessToken app API token
*/
module.exports = (destination, deviceId, apiAccessToken, callback) => {
	var loc;
	var title;
	var speech;
	var reprompt = "";
	var shouldEndSession = true;
	var shouldSendAuth = false;

	new Promise(
		(resolve, reject) => {

			loc(deviceId, apiAccessToken, (result) => {
			var type = typeof result;
			if(type == "string") { //real location!
				loc = result;
				resolve(loc);
			}else if(type == "number") { //bad, try authenticating
				if(result == 403) { //need to send auth card
					shouldSendAuth = true;
					reject();
				}
			}
		})	
	}).then((loc) => {
		if(destination) {
			//TODO: Google API Calls HERE
			var route = "4";
			var stop = "Street Street (East Side)";
			var time = "11:59";

			title = "Bus To " + destination;
			speech = `The next bus to ${destination} is the ${route} from ${stop} at ${time}.`
			resolve();
		}else {
			title = "Bus To";
			speech =  "Sorry, I need a destination to do that.";
			resolve();
		}
	}).then(() => {
		if(shouldSendAuth){
			var card = resp.buildLocationPermissionResponseCard();
			var speech = resp.buildSpeechletResponseSpeech("PlainText", "To do that, please open your Alexa app and grant location permission using the card I just sent you!", "PlainText", "");
			callback(null, resp.buildResponse({}, resp.buildResponse({}, resp.buildCustomSpeechletResponse(card, speech))));
		}
		else
			callback(null, resp.buildResponse({}, resp.buildSpeechletResponse(title, speech, reprompt, shouldEndSession)));
		resolve();
	});

};
