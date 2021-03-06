const request = require("request");


module.exports = (deviceId, authKey, callback) => {
	var options = {
	  url: `https://api.amazonalexa.com/v1/devices/${deviceId}/settings/address`,
	  headers: {
	    'Accept': 'application/json',
	    'Authorization': `Bearer ${authKey}`,
	    'Host': 'api.amazonalexa.com'
	  }
	};

	request(options, (error, response, body) => {
		if(error)
			callback(error);

		if(response.statusCode == 200) { //OK
			body = JSON.parse(body);
			var addr = body.addressLine1 + " ";
			if(body.addressLine2)
				addr += body.addressLine2 + " ";
			if(body.addressLine3)
				arrd += body.addressLine3 + " ";

			addr += body.city + " " + body.stateOrRegion;
			callback(addr);
		}else{ //other codes (ie. 403 is missing loc permission)
			console.log(body);
			callback(response.statusCode);
		}
	});
	
};