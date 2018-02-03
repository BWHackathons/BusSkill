const _ = require('lodash');

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {

    var obj = {shouldEndSession};
    _.merge(obj, buildSpeechletResponseCard("Standard", title, output, undefined), buildSpeechletResponseSpeech("PlainText", output, "PlainText", repromptText));
    return obj;
}

function buildSpeechletResponseCard(type, title, text, imageUrl) {
    var obj = {
        card: {
            type: type,
            title: title,
            text: text,
        }
    };
    if(imageUrl != undefined)
        _.set(obj, 'card.image.smallImageUrl', imageUrl);
    return obj;
}

function buildSpeechletResponseSpeech(type, text, repromptType, repromptText)
{
    var obj = {
        outputSpeech: {
            type: type,
        },
        reprompt: {
            outputSpeech: {
                type: repromptType,
            },
        }
    };

    if(type == "SSML")
        _.set(obj, "outputSpeech.ssml", text);
    else
        _.set(obj, "outputSpeech.text", text);

    if(repromptType == "SSML")
        _.set(obj, "reprompt.outputSpeech.ssml", repromptText);
    else
        _.set(obj, "reprompt.outputSpeech.text", repromptText);
    return obj;
}

function buildCustomSpeechletResponse()
{
    var obj = {};
    for(var i=0; i<arguments.length; i++)
        _.merge(obj, arguments[i]);
    return obj;
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

function buildLocationPermissionResponseCard() {
    return {
        "card": {
          "type": "AskForPermissionsConsent",
          "permissions": [
            "read::alexa:device:all:address"
          ]
        }
    }
}

module.exports = {
                  buildResponse, 
                  buildSpeechletResponse, 
                  buildCustomSpeechletResponse, 
                  buildSpeechletResponseSpeech, 
                  buildSpeechletResponseCard, 
                  buildLocationPermissionResponseCard
                };