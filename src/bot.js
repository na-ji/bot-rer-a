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
    // const {sessionId, context, entities} = request;
    const {text} = response;
    console.log(text);
  },
  getSchedule ({context, entities}) {
    return new Promise(function (resolve, reject) {
      var origin : null = firstEntityValue(entities, 'origin');
      var direction = firstEntityValue(entities, 'direction');
      if (origin && direction) {
        try {
          api.getSchedule(origin, direction)
          .then(function (response: Object) {
            context.origin = response.origin.name;
            context.direction = response.direction.name;
            context.schedule = '';

            _.forEach(response.schedules, function (schedule) {
              if (schedule.message.indexOf('Train sans arrêt') < 0) {
                let hour = schedule.message.match(/(\d{1,2}:\d{1,2})/i);
                if (hour) {
                  context.schedule += ` \n - ${hour[1]} - ${schedule.destination}`;
                }
              }
            });

            delete context.missingDirection;
            return resolve(context);
          }).catch(function (error) {
            console.log(error);
            return reject(context);
          });
        } catch (exception) {
          console.log(exception);
          return reject(context);
        }
      } else {
        context.missingDirection = true;
        delete context.schedule;
        return resolve(context);
      }
    });
  }
};

const client = new Wit({accessToken, actions});
interactive(client);
