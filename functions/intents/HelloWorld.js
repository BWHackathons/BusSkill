const lib = require('lib');
const resp = require('../../helpers/AlexaResponse');

/**
* Basic "Hello World" intent, can receive a `name` parameter
* @param {string} name Your name
* @returns {object}
*/
module.exports = (name = 'World', callback) => {

  return callback(null, resp.buildResponse({}, resp.buildSpeechletResponse(`Hello`, `Hello ${name}`, "", true)));

};
