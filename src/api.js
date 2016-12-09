// @flow
'use strict';

let request = require('request');
let _ = require('lodash');
const apiURL = 'https://api-ratp.pierre-grimaud.fr/v2/';
let events = require('events');

class RATPApi extends events.EventEmitter {
  typeLigne: string;
  line: string;
  destinations: Array<Object>;
  stations: Array<Object>;
  ready: Function;

  fetchStations () : void {
    let self = this;
    request.get({url: apiURL + `${this.typeLigne}/${this.line}/stations`, json: true}, function (error, httpResponse, body: Object) {
      if (error) {
        throw error;
      }

      if (body.response.stations) {
        self.stations = body.response.stations;
      } else {
        throw new Error('stations not found');
      }
      self.ready();
    });
  }

  fetchDestinations () : void {
    let self = this;
    request.get({url: apiURL + this.typeLigne, json: true}, function (error, httpResponse, body: Object) {
      if (error) {
        throw error;
      }

      if (_.some(body.response[self.typeLigne], { 'line': self.line })) {
        self.destinations = _.find(body.response[self.typeLigne], { 'line': self.line }).destinations;
      } else {
        throw new Error('line not found');
      }
      self.ready();
    });
  }

  getSchedule (origin: string, destination: string) : Promise<Object> {
    // we try to find the SLUG of the origin and destination
    let oRequest: Array<string> = origin.trim().toLowerCase().replace(/ +/, ' ').split(' ');
    let dRequest: Array<string> = destination.trim().toLowerCase().replace(/ +/, ' ').split(' ');
    let self = this;
    let i = 0;
    let count = 0;
    let foundOrigin: Object;
    let foundDestination: Object;

    return new Promise(function (resolve, reject) {
      _.forEach([oRequest, dRequest], function (request: Array<string>, ind: number) {
        let isDestination: boolean = (ind > 0);
        let stations: Array<Object> = (isDestination ? _.cloneDeep(self.destinations) : _.cloneDeep(self.stations));

        let results: Array<Object> = _.filter(stations, function (station: Object, index: number) {
          count = 0;

          for (i = request.length - 1; i >= 0; i--) {
            if (station.slug.indexOf(request[i]) > -1) {
              count++;
            }
          }

          stations[index].count = count;

          return count > 0;
        });

        results = _.orderBy(results, ['count'], ['desc']);

        if (results.length) {
          if (isDestination) {
            foundDestination = results[0];
          } else {
            foundOrigin = results[0];
          }
        } else {
          if (isDestination) {
            reject(new Error('Destination not found'));
          } else {
            reject(new Error('Origin not found'));
          }
        }
      });

      request.get({
        url: apiURL + `${self.typeLigne}/${self.line}/stations/${foundOrigin.id}?destination=${foundDestination.id}`,
        json: true
      }, function (error, httpResponse, body: Object) {
        if (error) {
          reject(error);
        }

        if (body.response.schedules) {
          resolve({
            origin: foundOrigin,
            direction: foundDestination,
            schedules: body.response.schedules
          });
        } else {
          reject(new Error('schedules not found'));
        }
      });
    });
  }

  constructor (typeLigne: string, line: string) {
    super();
    this.typeLigne = typeLigne;
    this.line = line;
    this.destinations = [];
    this.stations = [];

    let self = this;
    this.ready = _.after(2, function () {
      self.emit('ready');
    });

    this.fetchDestinations();
    this.fetchStations();
  }
}

module.exports = RATPApi;
