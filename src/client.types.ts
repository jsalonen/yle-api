export interface IApiAuth {
  appId: string;
  appKey: string;
  decryptKey?: string | null;
}

export interface IApiResponseMetadata {
  offset: string;
  limit: string;
  count: number;
  program: number;
  clip: number;
}

export interface IApiResponse {
  apiVersion: string;
  meta: IApiResponseMetadata;
  data: any;
}

export interface ILocalizedField {
  fi?: string;
  en?: string;
  sv?: string;
}

export interface IProgramImage {
  id: string;
  available: boolean;
  type: string;
  version: number;
}

export interface IApiResponseProgramData {
  description: ILocalizedField;
  video: any; // TODO: add exact typing
  typeMedia: string;
  creator: any; // TODO: add exact typing
  indexDataModified: string;
  alternativeId: string[];
  type: string;
  duration: string;
  productionId: string;
  contentRating: any; // TODO: add exact typing
  title: ILocalizedField;
  itemTitle: any; // TODO: add exact typing
  countryOfOrigin: string[];
  id: string;
  typeCreative: string;
  image: IProgramImage;
  audio: any[]; // TODO: add exact typing
  originalTitle: object; // TODO: add exact typing
  publicationEvent: any[]; // TODO: add exact typing
  collection: string;
  subject: object[]; // TODO: add exact typing
  subtitling: object[]; // TODO: add exact typing
}

export interface IApiResponseProgram extends IApiResponse {
  data: IApiResponseProgramData;
}
