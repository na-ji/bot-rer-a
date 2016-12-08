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

  // getSchedule (origin: string, destination: string) : Object {
  // }

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
