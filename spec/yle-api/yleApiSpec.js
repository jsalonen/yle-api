var path = require('path');
var nock = require('nock');
var URI = require('URIjs');
var querystring = require('querystring');

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

describe('YleApi', function() {
  const YleApi = require('../../lib/');

  describe('getPrograms', function() {
    it('should return error with invalid appKey', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/items.json')
        .query(true)
        .reply(function(uri, requestBody) {
          return [401, 'Unauthorized'];
        });

      var yleApi = new YleApi(YLEAPI_PARAMS_INVALID_APPKEY);
      yleApi.getPrograms({}, function(err, programs) {
        expect(err).toMatch('401');
        done();
      });
    });

    it('should return programs', function(done) {
      nock('https://external.api.yle.fi/v1/')
        .get('/programs/items.json')
        .query(true)
        .replyWithFile(200, path.join(__dirname, '../responses/get_programs.json'));

      var yleApi = new YleApi(YLEAPI_PARAMS_VALID);
      yleApi.getPrograms({}, function(err, programs) {
        expect(err).toBe(null);
        done();
      });
    })
  });
});
