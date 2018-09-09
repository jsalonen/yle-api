import fetch from 'node-fetch';
import URI from 'urijs';
import { decrypt } from './mediaurl';
import {
  IApiAuth,
  IApiResponse,
  IApiResponseProgram,
  IApiResponsePrograms,
  Program,
  ProgramPublicationEvent,
  PlayoutProtocol
} from './client.types';
import {
  makeImageTransformationString,
  CloudinaryImageTransformations,
  CloudinaryImageFormat
} from './cloudinary';

const API_URL = 'https://external.api.yle.fi/v1/';
const IMAGES_URL = 'http://images.cdn.yle.fi/image/upload/';

class Client {
  apiAuth: IApiAuth;
  fetcher: typeof fetch;

  constructor(apiAuth: IApiAuth, fetcher = fetch) {    
    this.apiAuth = apiAuth;
    this.fetcher = fetch;
  }

  _queryParamsWithCredentials(params: object) {
    return Object.assign(params, {
      app_id: this.apiAuth.appId,
      app_key: this.apiAuth.appKey
    });
  }

  async fetchPrograms (queryOptions: any = {}): Promise<IApiResponsePrograms> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .suffix('json')
        .query(this._queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await this.fetcher(url);
    return await response.json();
  }
  
  async fetchProgramsNow (queryOptions: any): Promise<IApiResponse> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('schedules')
        .segment('now')
        .suffix('json')
        .query(this._queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await this.fetcher(url);
    return await response.json();    
  }

  async fetchProgram (id: string): Promise<IApiResponseProgram> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .segment(id)
        .suffix('json')
        .query(this._queryParamsWithCredentials({}))
        .toString();

    const response = await this.fetcher(url);
    return await response.json();    
  }

  getImageUrl(
    programImageId: string,
    format: CloudinaryImageFormat = 'jpg',
    transformations?: CloudinaryImageTransformations | null
  ): string {
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

  findPlayablePublicationsByProgram(program: Program): ProgramPublicationEvent[] {
    return (
      program.publicationEvent.filter((event) => {
        return(event.temporalStatus === 'currently' && event.type === 'OnDemandPublication');
      })
    )
  }

  async fetchPlayouts(
    programId: string,
    mediaId: string,
    protocol: PlayoutProtocol
  ) {
    const url =
      URI(API_URL)
        .segment('media')
        .segment('playouts')
        .suffix('json')
        .query(this._queryParamsWithCredentials({
          program_id: programId,
          media_id: mediaId,
          protocol: protocol
        }))
        .toString();

    const response = await this.fetcher(url);
    return await response.json();
  }

  decryptMediaUrl(url: string): string {
    const key = this.apiAuth.decryptKey;
    if(!key) {
      throw Error("Media decryption key required for decrypting media URLs");
    } else {
      return decrypt(url, key);
    }
  }
}

export default Client;
