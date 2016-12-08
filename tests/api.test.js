let RATPApi = require('../build/api');
let api;
let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
let expect = chai.expect;

describe('api', function () {
  this.timeout(10000);

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

  describe('getSchedule', () => {
    it('should return schedules', function (done) {
      api.getSchedule('bussy st georges', 'marne la valée chessy').then(result => {
        expect(result).to.be.an('array');
        expect(result).not.to.be.empty;
        done();
      }).catch(error => {
        expect(error).to.be.empty;
        done();
      });
    });

    it('should reject wrong origin', function () {
      return expect(api.getSchedule('aaaaaa', 'bbbbb')).to.be.rejectedWith(Error, 'Origin not found');
    });

    it('should reject wrong destination', function () {
      return expect(api.getSchedule('bussy st georges', 'bbbbb')).to.be.rejectedWith(Error, 'Destination not found');
    });
  });
});
