import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch'
import URI from 'urijs'
import {
  ApiAuth,
  ApiRequestPrograms,
  ApiRequestProgramsNow,
  ApiResponseMediaPlayouts,
  ApiResponseProgram,
  ApiResponsePrograms,
  ApiResponseProgramsNow,
  PlayoutProtocol,
  Program,
  ProgramPublicationEvent
} from './client.types'
import {
  CloudinaryImageFormat,
  CloudinaryImageTransformations,
  makeImageTransformationString
} from './cloudinary'
import { decrypt } from './mediaurl'

const API_URL = 'https://external.api.yle.fi/v1/'
export const IMAGES_URL = 'https://images.cdn.yle.fi/image/upload/'

type Fetcher = (url: RequestInfo, init?: RequestInit) => Promise<Response>

class Client {
  public apiAuth: ApiAuth
  public fetcher: Fetcher

  constructor(apiAuth: ApiAuth, fetcher: Fetcher = fetch) {
    this.apiAuth = apiAuth
    this.fetcher = fetcher
  }

  public async fetchPrograms(queryOptions: ApiRequestPrograms = {}): Promise<ApiResponsePrograms> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .suffix('json')
        .query(this.queryParamsWithCredentials(queryOptions))
        .toString()

    const response = await this.fetcher(url)
    return this.retrieveJSONOrError(response)
  }

  public async fetchProgramsNow(queryOptions: ApiRequestProgramsNow = {}): Promise<ApiResponseProgramsNow> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('schedules')
        .segment('now')
        .suffix('json')
        .query(this.queryParamsWithCredentials(queryOptions))
        .toString()

    const response = await this.fetcher(url)
    return this.retrieveJSONOrError(response)
  }

  public async fetchProgram(id: string): Promise<ApiResponseProgram> {
    const url =
      URI(API_URL)
        .segment('programs')
        .segment('items')
        .segment(id)
        .suffix('json')
        .query(this.queryParamsWithCredentials({}))
        .toString()

    const response = await this.fetcher(url)
    return this.retrieveJSONOrError(response)
  }

  public getImageUrl(
    programImageId: string,
    format: CloudinaryImageFormat = 'jpg',
    transformations?: CloudinaryImageTransformations
  ): string {
    let url = URI(IMAGES_URL)
    if (transformations) {
      url = url.segment(makeImageTransformationString(transformations))
    }

    return (
      url
        .segment(programImageId)
        .suffix(format)
        .toString()
    )
  }

  public findPlayablePublicationsByProgram(program: Program): ProgramPublicationEvent[] {
    return (
      program.publicationEvent.filter((event) => {
        return(event.temporalStatus === 'currently' && event.type === 'OnDemandPublication')
      })
    )
  }

  public async trackStreamStart(programId: string, mediaId: string): Promise<void> {
    const url =
      URI(API_URL)
        .segment('tracking')
        .segment('streamstart')
        .query(this.queryParamsWithCredentials({
          program_id: programId,
          media_id: mediaId
        }))
        .toString()

    const response = await this.fetcher(url)
    if (!response.ok) {
      return Promise.reject(`Track stream failed: ${response.status} ${response.statusText}`)
    }
  }

  public async fetchPlayouts(
    programId: string,
    mediaId: string,
    protocol: PlayoutProtocol,
    decryptMediaUrls = true
  ): Promise<ApiResponseMediaPlayouts> {
    const decryptKey = this.apiAuth.decryptKey
    if (decryptMediaUrls && !decryptKey) {
      const decryptKeyMissingError = () => {
        throw new Error('Missing media decryption key')
      }
      throw decryptKeyMissingError
    }

    const url =
      URI(API_URL)
        .segment('media')
        .segment('playouts')
        .suffix('json')
        .query(this.queryParamsWithCredentials({
          program_id: programId,
          media_id: mediaId,
          protocol
        }))
        .toString()

    const maybeDecryptMediaUrls = (playouts: ApiResponseMediaPlayouts) => {
      if (!decryptMediaUrls) {
        return playouts
      } else {
        return this.decryptMediaUrls(playouts, this.apiAuth.decryptKey as string)
      }
    }

    const response = await this.fetcher(url)

    return this
      .retrieveJSONOrError(response)
      .then(maybeDecryptMediaUrls)
  }

  private queryParamsWithCredentials(params: object) {
    return Object.assign(params, {
      app_id: this.apiAuth.appId,
      app_key: this.apiAuth.appKey
    })
  }

  private async retrieveJSONOrError(response: Response) {
    if (!response.ok) {
      return Promise.reject(response.statusText)
    } else {
      return await response.json()
    }
  }

  private decryptMediaUrls(playouts: ApiResponseMediaPlayouts, decryptKey: string) {
    return {
      ...playouts,
      data: playouts.data.map((playout) => {
        return {
          ...playout,
          url: decrypt(playout.url, decryptKey)
        }
      })
    }
  }
}

export default Client
