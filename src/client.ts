import fetch from 'node-fetch';
import URI from 'urijs';
import { decrypt } from './mediaurl';
import {
  ApiAuth,
  ApiResponse,
  ApiResponseProgram,
  ApiResponsePrograms,
  ApiResponseMediaPlayouts,
  Program,
  ProgramPublicationEvent,
  PlayoutProtocol
} from './client.types';
import {
  makeImageTransformationString,
  CloudinaryImageTransformations,
  CloudinaryImageFormat
} from './cloudinary';
import { Response } from 'node-fetch';

const API_URL = 'https://external.api.yle.fi/v1/';
const IMAGES_URL = 'http://images.cdn.yle.fi/image/upload/';

class Client {
  apiAuth: ApiAuth;
  fetcher: typeof fetch;

  constructor(apiAuth: ApiAuth, fetcher: typeof fetch = fetch) {    
    this.apiAuth = apiAuth;
    this.fetcher = fetcher;
  }

  private queryParamsWithCredentials(params: object) {
    return Object.assign(params, {
      app_id: this.apiAuth.appId,
      app_key: this.apiAuth.appKey
    });
  }

  private async retrieveJSONOrError(response: Response) {
    if(!response.ok) {
      return Promise.reject(response.statusText);
    } else {
      return await response.json();
    }
  }

  async fetchPrograms (queryOptions: any = {}): Promise<ApiResponsePrograms> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .suffix('json')
        .query(this.queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await this.fetcher(url);
    return this.retrieveJSONOrError(response);
  }
  
  async fetchProgramsNow (queryOptions: any= {}): Promise<ApiResponse> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('schedules')
        .segment('now')
        .suffix('json')
        .query(this.queryParamsWithCredentials(queryOptions))
        .toString();

    const response = await this.fetcher(url);
    return this.retrieveJSONOrError(response);
  }

  async fetchProgram (id: string): Promise<ApiResponseProgram> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .segment(id)
        .suffix('json')
        .query(this.queryParamsWithCredentials({}))
        .toString();

    const response = await this.fetcher(url);
    return this.retrieveJSONOrError(response);
  }

  getImageUrl(
    programImageId: string,
    format: CloudinaryImageFormat = 'jpg',
    transformations?: CloudinaryImageTransformations
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

  private decryptMediaUrls(playouts: ApiResponseMediaPlayouts, decryptKey: string) {
    return {
      ...playouts,
      data: playouts.data.map(playout => {
        return {
          ...playout,
          url: decrypt(playout.url, decryptKey)
        }
      })
    }
  }

  async fetchPlayouts(
    programId: string,
    mediaId: string,
    protocol: PlayoutProtocol,
    decryptMediaUrls = true
  ): Promise<ApiResponseMediaPlayouts> {
    const decryptKey = this.apiAuth.decryptKey;
    if(decryptMediaUrls && !decryptKey) {
      const decryptKeyMissingError = () => {
        throw new Error('Missing media decryption key');
      };
      throw decryptKeyMissingError;
    }

    const url =
      URI(API_URL)
        .segment('media')
        .segment('playouts')
        .suffix('json')
        .query(this.queryParamsWithCredentials({
          program_id: programId,
          media_id: mediaId,
          protocol: protocol
        }))
        .toString();

    const maybeDecryptMediaUrls = (playouts: ApiResponseMediaPlayouts) => {
      if(!decryptMediaUrls) {
        return playouts;
      } else {
        return this.decryptMediaUrls(playouts, this.apiAuth.decryptKey as string);
      }
    };

    const response = await this.fetcher(url);

    return this
      .retrieveJSONOrError(response)
      .then(maybeDecryptMediaUrls);
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
