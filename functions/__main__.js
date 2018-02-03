const lib = require('lib');

/**
* @param {string} name Intent Name to trigger
* @param {object} slots Slot Information
* @param {object} request Request Object (required)
* @returns {any}
*/
module.exports = (name = '', slots = {}, request = {}, context, callback) => {

  request.intent = request.intent || {
    name: name,
    slots: Object.keys(slots).reduce((obj, key) => {
      obj[key] = (slots[key] && typeof slots[key] === 'object') ?
        slots[key] : {name: key, value: slots[key]};
      return obj[key];
    }, {})
  };

  if (!request.intent.name) {
    return callback(new Error('Intent name is required'));
  }

  let params = Object.keys(request.intent.slots || {}).reduce((params, key) => {
    params[key] = request.intent.slots[key].value;
    return params;
  }, {});

  if(request.intent.name == "NextBusTo") {
    lib[`${context.service.identifier}.intents.${request.intent.name}`](request, (err, result) => {

      return callback(null, result);

    });
  }else{
    lib[`${context.service.identifier}.intents.${request.intent.name}`](params, (err, result) => {

      return callback(null, result);

    });
  }

  

};
