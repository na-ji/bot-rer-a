// @flow
'use strict';

let Wit = require('node-wit').Wit;
let interactive = require('node-wit').interactive;
let _ = require('lodash');
let RATPApi = require('./api');
let api = new RATPApi('rers', 'A');

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node src/bot.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send (request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('sending...', JSON.stringify(response));
  },
  getSchedule ({context, entities}) {
    var origin : null = firstEntityValue(entities, 'origin');
    var direction = firstEntityValue(entities, 'direction');
    if (origin && direction) {
      context.schedule = '{schedule}';
      delete context.missingDirection;
    } else {
      context.missingDirection = true;
      delete context.schedule;
    }
    return context;
  }
};

const client = new Wit({accessToken, actions});
interactive(client);
