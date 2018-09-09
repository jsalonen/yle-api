var path = require('path');
var nock = require('nock');
var URI = require('urijs');
var querystring = require('querystring');
var Client = require('../../dist/client');

nock.disableNetConnect();

const YLEAPI_PARAMS_VALID = {
  appId: 'VALID_APP_ID',
  appKey: 'VALID_APP_KEY',
  decryptKey: 'VALID_DECRYPT_KEY'
};

const YLEAPI_PARAMS_INVALID_APPKEY = {
  appId: 'VALID_APP_ID',
  appKey: 'INVALID_APP_KEY',
  decryptKey: 'VALID_DECRYPT_KEY'
};

function hasValidCredentials(path) {
  return 
    (path.indexOf('app_id=VALID_APP_ID') > -1) &&
    (path.indexOf('app_key=VALID_APP_KEY') > -1);
};

describe('Client', function() {
  describe('getPrograms', function() {
    it('should return error with invalid appKey', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/items.json')
        .query(true)
        .reply(function(uri, requestBody) {
          return [401, 'Unauthorized'];
        });

      var client = new Client(YLEAPI_PARAMS_INVALID_APPKEY);
      client.getPrograms({}, function(err, programs) {
        expect(err).toMatch('401');
        done();
      });
    });

    it('should return programs', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/items.json')
        .query(true)
        .replyWithFile(200, path.join(__dirname, '../responses/get_programs.json'));

      var client = new Client(YLEAPI_PARAMS_VALID);
      client.getPrograms({}, function(err, programs) {
        expect(err).toBe(null);
        done();
      });
    })
  });

  describe('getProgramsNow', function() {
    it('should return error with invalid appKey', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/schedules/now.json')
        .query(true)
        .reply(function(uri, requestBody) {
          return [401, 'Unauthorized'];
        });

      var client = new Client(YLEAPI_PARAMS_INVALID_APPKEY);
      client.getProgramsNow({}, function(err, programs) {
        expect(err).toMatch('401');
        done();
      });
    });

    it('should return programs now', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/schedules/now.json')
        .query(true)
        .replyWithFile(200, path.join(__dirname, '../responses/get_programs_now.json'));

      var client = new Client(YLEAPI_PARAMS_VALID);
      client.getProgramsNow({}, function(err, programs) {
        expect(err).toBe(null);
        done();
      });
    })
  });
});
