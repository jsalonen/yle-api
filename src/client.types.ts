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

export interface LocalizedField {
  [key: string]: string;
}

export interface IProgramImage {
  id: string;
  available: boolean;
  type: string;
  version: number;
}

type PublicationEventType = 'ScheduledTransmission' | 'OnDemandPublication';
type PublicationEventTemporalStatus = 'currently' | 'in-future';

export interface ProgramPublicationEvent {
  tags: object; // TODO: add exact typing
  service: object; // TODO: add exact typing
  publisher: object; // TODO: add exact typing
  startTime: string;
  temporalStatus: PublicationEventTemporalStatus;
  endTime: string;
  type: PublicationEventType;
  duration: string;
  region: 'Finland' | string; // TODO: add missing string values
  id: string;
  media: any; // TODO: add exact typing
  version: number;
}

export interface Program {
  description: LocalizedField;
  video: any; // TODO: add exact typing
  typeMedia: string;
  creator: any; // TODO: add exact typing
  indexDataModified: string;
  alternativeId: string[];
  type: string;
  duration: string;
  productionId: string;
  contentRating: any; // TODO: add exact typing
  title: LocalizedField;
  itemTitle: any; // TODO: add exact typing
  countryOfOrigin: string[];
  id: string;
  typeCreative: string;
  image: IProgramImage;
  audio: any[]; // TODO: add exact typing
  originalTitle: object; // TODO: add exact typing
  publicationEvent: ProgramPublicationEvent[];
  collection: string;
  subject: object[]; // TODO: add exact typing
  subtitling: object[]; // TODO: add exact typing
}

export interface IApiResponseProgram extends IApiResponse {
  data: Program;
}

export interface IApiResponsePrograms extends IApiResponse {
  data: Program[];
}

export type PlayoutProtocol = 'HLS' | 'HDS' | 'PMD' | 'RTMPE';
