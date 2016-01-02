'use strict';

var request = require('request');
var URI = require('urijs');
var media = require('./media');

const API_URL = 'https://external.api.yle.fi/v1/';
const IMAGES_URL = 'http://images.cdn.yle.fi/image/upload/';
const EVENT_TEMPORAL_STATUS_CURRENTLY = 'currently';
const EVENT_TYPE_ONDEMAND_PUBLICATION = 'OnDemandPublication';
const PROTOCOL_HTTP_LIVE_STREAMING = 'HLS';
const PROTOCOL_HTTP_DYNAMIC_STREAMING = 'HDS';

function withCredentials(queryOptions) {
  return Object.assign(queryOptions, {
    app_id: this.appId,
    app_key: this.appKey
  });
}

class yleApi {
  constructor(apiAuth) {    
    this.appId = apiAuth.appId;
    this.appKey = apiAuth.appKey;
    this.decryptKey = apiAuth.decryptKey;
  }

  getPrograms (queryOptions, callback) {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .suffix('json')
        .query(withCredentials.bind(this, queryOptions))
        .toString();

    request
      .get({url}, (err, response, body) => {
        if(!response) {
          return callback(`Invalid response`, null);
        } else {
          if(response.statusCode != 200) {
            callback(response.statusCode, null);
          } else {
            var response = JSON.parse(body);
            callback(null, response.data);
          }
        }
      });
  }

  getProgram (id, callback) {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .segment(id)
        .suffix('json')
        .query(withCredentials.bind(this, {}))
        .toString();

    request
      .get({url}, (err, response, body) => {
        let {statusCode, statusMessage} = response;

        if(statusCode != 200) {
          callback(`${statusCode} ${statusMessage}`, null);
        } else {
          let {apiVersion, meta, data} = JSON.parse(body);
          callback(null, data);
        }
      });
  }

  getProgramStream(programId, callback) {
    this._findPlayableMedia(programId, (err, media) => {
      if(err) {
        return callback(err, null);
      } else {
        const url =
          URI(API_URL)
            .segment('media')
            .segment('playouts')
            .suffix('json')
            .query(withCredentials.bind(this, {
               program_id: programId,
               media_id: media.id,
               protocol: PROTOCOL_HTTP_LIVE_STREAMING
            }))
            .toString();

        request
          .get({url}, (err, response, body) => {
            let {statusCode, statusMessage} = response;

            if(err || statusCode != 200) {
              callback(`${statusCode} ${statusMessage}`, null);
            } else {
              let playouts =
                this._decryptPlayouts( JSON.parse(body).data );
              callback(null, playouts);
            }
          });
      }
    });
  }

  getProgramImage(programId, callback) {
    this.getProgram(programId, (err, program) => {
      program.image.url =
        URI(IMAGES_URL)
          .segment(program.image.id)
          .suffix('jpg')
          .toString();
      callback(null, program.image);
    });
  }

  _withCredentials (queryOptions) {
    return Object.assign(queryOptions, {
      app_id: this.appId,
      app_key: this.appKey
    });
  }

  _findPlayableMedia(id, callback) {
    this.getProgram(id, (err, program) => {
      if(program && program.publicationEvent !== undefined) {
        for (let event of program.publicationEvent) {
          if(event.temporalStatus === EVENT_TEMPORAL_STATUS_CURRENTLY &&
             event.type === EVENT_TYPE_ONDEMAND_PUBLICATION) {
            return callback(null, event.media);
          }
        }

        callback(err, null);
      } else {
        callback('No matches', null);
      }
    });
  }

  _decryptPlayouts(playouts) {
    return playouts.map( (playout) => {
      playout.url = media.decrypt(playout.url, this.decryptKey);
      return playout;
    });
  }
};

module.exports = yleApi;
