import fetch from 'node-fetch';
import URI from 'urijs';
import { decrypt } from './mediaurl';
import { IApiAuth, IApiResponse, IApiResponseProgram } from './client.types';
import { makeImageTransformationString, CloudinaryImageTransformations } from './cloudinary';
const API_URL = 'https://external.api.yle.fi/v1/';
const IMAGES_URL = 'http://images.cdn.yle.fi/image/upload/';
const EVENT_TEMPORAL_STATUS_CURRENTLY = 'currently';
const EVENT_TYPE_ONDEMAND_PUBLICATION = 'OnDemandPublication';

type ImageFormat = 'jpg' | 'png' | 'gif';

class Client {
  apiAuth: IApiAuth;

  constructor(apiAuth: IApiAuth) {    
    this.apiAuth = apiAuth;
  }

  _queryParamsWithCredentials(params: object) {
    return Object.assign(params, {
      app_id: this.apiAuth.appId,
      app_key: this.apiAuth.appKey
    });
  }

  async getPrograms (queryOptions: any): Promise<IApiResponse> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .suffix('json')
        .query(this._queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await fetch(url);
    return await response.json();
  }
  
  async getProgramsNow (queryOptions: any): Promise<IApiResponse> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('schedules')
        .segment('now')
        .suffix('json')
        .query(this._queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await fetch(url);
    return await response.json();    
  }

  async getProgram (id: string): Promise<IApiResponseProgram> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .segment(id)
        .suffix('json')
        .query(this._queryParamsWithCredentials({}))
        .toString();

    const response = await fetch(url);
    return await response.json();    
  }

  async getImageUrl(
    programImageId: string,
    format: ImageFormat = 'jpg',
    transformations?: CloudinaryImageTransformations | null
  ): Promise<string> {
    let url = URI(IMAGES_URL);
    if(transformations) {
      url = url.segment(makeImageTransformationString(transformations));
    }

    return (
      url
        .segment(programImageId)
        .suffix(format)
        .toString()
    );
  }

  /*
  async getProgramStream(id: string, protocol: string) {
    this._findPlayableMedia(programId, (err, media) => {
      if(err) {
        return callback(err, null);
      } else {
        const url =
          URI(API_URL)
            .segment('media')
            .segment('playouts')
            .suffix('json')
            .query(this._withCredentials({
               program_id: programId,
               media_id: media.id,
               protocol: protocol
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
      playout.url = decrypt(playout.url, this.decryptKey);
      return playout;
    });
  }
  */
}

export default Client;
