// @flow
'use strict';

let request = require('request');
let _ = require('lodash');
const apiURL = 'https://api-ratp.pierre-grimaud.fr/v2/';

class RATPApi {
  typeLigne: string;
  line: string;
  destinations: Array<Object>;
  stations: Array<Object>;

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
    });
  }

  constructor (typeLigne: string, line: string) {
    this.typeLigne = typeLigne;
    this.line = line;
    this.destinations = [];
    this.stations = [];

    this.fetchDestinations();
    this.fetchStations();
  }
}

module.exports = RATPApi;
