let RATPApi = require('../build/api');
let api;
let expect = require('chai').expect;

describe('api', () => {
  before(function (done) {
    api = new RATPApi('rers', 'A');
    api.on('ready', function () {
      done();
    });
  });

  it('should have destinations', function () {
    expect(api).to.exist;
    expect(api.destinations).to.exist;
    expect(api.destinations).to.be.an('array');
    expect(api.destinations).not.to.be.empty;
  });

  it('should have stations', function () {
    expect(api).to.exist;
    expect(api.stations).to.exist;
    expect(api.stations).to.be.an('array');
    expect(api.stations).not.to.be.empty;
  });
});
