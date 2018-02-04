'use strict';

// -------------------------------- Constants ------------------------------------
const KEYS = require("./keys.js");

// -------------------------------- Node Modules ------------------------------------
var _ = require('lodash');
const loc = require('helpers/Location');
const request = require('request');
const gmapi = require('@google/maps').createClient({
    key: KEYS.gapi,
    Promise: Promise
});

// --------------- Helpers that build all of the responses -----------------------

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




// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    console.log("RESPONSE CALL"); //J
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome to BusPal';
    const speechOutput = 'Welcome to BusPal. ' +
        'You can ask me questions about busses in any transit system!';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'You can ask me questions about busses! ' +
                            'Try saying, when is the next bus to Walter Light Hall.';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thanks for using Bus Pal!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function getHelpResponse(callback)
{
    const sessionAttributes = {};
    const cardTitle = 'Bus Pal Help';
    const speechOutput = 'Welcome to Bus Pal. ' +
        'Help is coming soon.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Help is coming soon';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Responds to user requests for a color code computation
 */
function getNextBusTo(intent, deviceId, apiAccessToken, session, callback)
{
    let cardTitle = intent.name;
    const locationSlot = intent.slots.location;
    let shouldEndSession = true;
    let speechOutput = '';
    let repromptText = '';
    var shouldSendAuth = false;

    console.log("gnbt");  

    if(locationSlot && locationSlot.value) {
        var location = locationSlot.value;
        new Promise(
            (resolve, reject) => {
                console.log("prom");
                loc(deviceId, apiAccessToken, (result) => {
                    var currentLocation;
                    var type = typeof result;
                    console.log("type: " + type);
                    if(type == "string") { //real location!
                        currentLocation = result;
                        resolve(currentLocation);
                    }else if(type == "number") { //bad, try authenticating
                        console.log("first promise res: " + result);
                        if(result == 403) { //need to send auth card
                            shouldSendAuth = true;
                            resolve();
                        }
                    }
                })  
        }).then((currentLocation) => {
            console.log(`.then currentLocation: ${currentLocation}`);
            if(currentLocation)
                return gmapi.geocode({address: currentLocation}).asPromise();
            else{
                return null;
            }
        }).then((response) => {
            console.log(".then(response) - response" + JSON.stringify(response));
            console.log(".then(response) - loc" + location);
            var result = response.json.results[0];
            console.log(_.has(result, "geometry.location.lat"));
            console.log(_.has(result, "geometry.location.lng"));
            if(location && response && _.has(result, "geometry.location.lat") && _.has(result, "geometry.location.lng")) {
                var curLatLong=[response.json.results[0].geometry.location.lat,response.json.results[0].geometry.location.lng];
                var route = "4";
                var stop = "Union Street (West of University)";
                var time = "3 PM";

                //retrieve destination on map from Google API using location slot.
                var mapDestination = "https://maps.googleapis.com/maps/api/geocode/json?address=location&key=."

                //CHANGE ONCE NAVIGATION RETRIEVED FROM API
                cardTitle = "Bus To " + location;
                speechOutput = `The next bus to ${location} is the ${route} from ${stop} at ${time}.`
                return;
                
                
                
            }else {
                cardTitle = "Bus To";
                speechOutput =  "Sorry, I encountered an error when determining your requested locations. semicolon right paren";
                return;
            }
        }).then(() => {
            console.log("last then");
            if(shouldSendAuth){
                console.log("should send auth");
                var card = buildLocationPermissionResponseCard();
                var speech = buildSpeechletResponseSpeech("PlainText", "To do that, please open your Alexa app and grant location permission using the card I just sent you!", "PlainText", "");
                callback({}, buildCustomSpeechletResponse(card, speech));
            }
            else{
                console.log("regular callback");
                callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
            return;
        }).catch((err) => {
            if(err)
                console.log(err);
            callback({}, buildSpeechletResponse("Nope", "Something went wrong yo.", "", true));
        });
    }
}

// ------------------ Slot Collection Handlers -----------------------
// Handlers based off of https://github.com/alexa/alexa-cookbook/blob/master/handling-responses/dialog-directive-delegate/sample-nodejs-plan-my-trip/src/SampleWithoutTheSDK.js

/**
 * Primary slot collection handler
 */
function slotCollector(request, sessionAttributes, callback){
    if (request.dialogState === "STARTED") {
      var updatedIntent=request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      callback(sessionAttributes,
          buildSpeechletResponseWithDirectiveNoIntent());
    } else if (request.dialogState !== "COMPLETED") {
      // return a Dialog.Delegate directive with no updatedIntent property.
      callback(sessionAttributes,
          buildSpeechletResponseWithDirectiveNoIntent());
    } else {;
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
        return request.intent;
    }
}


// ------------------ Response Helpers -----------------------


// ------------------ Other Helpers -----------------------
function handleNumber(num)
{
    return parseInt(num.toString().replace(",", ""))
}

function roundDec(num, dec)
{
    return Math.round(num*Math.pow(10, dec))/Math.pow(10, dec);
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(request, intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intentName = intentRequest.intent.name;
    var intent;
    //if(intentName.startsWith("AMAZON."))
        intent = intentRequest.intent;
    //else
    //    intent = slotCollector(intentRequest, session.attributes, callback);

    // Dispatch to your skill's intent handlers
    if (intentName === 'NextBusTo') {
        var deviceId = request.context.System.device.deviceId;
        var apiKey = request.context.System.apiAccessToken;
        getNextBusTo(intent, deviceId, apiKey, session, callback);
    } else if (intentName === 'NextBusAtStop') {
        getHelpResponse(callback)
    } else if (intentName === 'Settings') {
        getHelpResponse(callback)
    } else if (intentName === 'RouteOptions') {
        getHelpResponse(callback)
    } else if(intentName === 'GetRouteSteps'){
        getHelpResponse(callback);
    }else if(intentName === 'GetBusAtTime'){
        getHelpResponse(callback);
    } else if(intentName === 'WhenToLeave'){
        getHelpResponse(callback);
    } else if(intentName === 'WhenToLeave'){
        getHelpResponse(callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getHelpResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        if (event.session.application.applicationId !== KEYS.appid) {
             callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event, event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
