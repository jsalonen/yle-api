export interface ApiAuth {
  appId: string;
  appKey: string;
  decryptKey?: string;
}

export interface ApiResponseMetadata {
  offset: string;
  limit: string;
  count: number;
  program: number;
  clip: number;
}

export interface ApiResponse {
  apiVersion: string;
  meta: ApiResponseMetadata;
  data: any;
}

export interface LocalizedField {
  [key: string]: string;
}

export interface ProgramImage {
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
  image: ProgramImage;
  audio: any[]; // TODO: add exact typing
  originalTitle: object; // TODO: add exact typing
  publicationEvent: ProgramPublicationEvent[];
  collection: string;
  subject: object[]; // TODO: add exact typing
  subtitling: object[]; // TODO: add exact typing
}

export interface MediaPlayout {
  subtitles: any;
  protocol: PlayoutProtocol;
  multibitrate: boolean;
  formatOf: string;
  width: number;
  height: number;
  type: string; // TODO: add exact typing
  url: string;
  live: boolean;
  protectionType: string; // TODO: add exact typing
}

export interface ApiResponseProgram extends ApiResponse {
  data: Program;
}

export interface ApiResponsePrograms extends ApiResponse {
  data: Program[];
}

export interface ApiRequestPrograms {
  id?: string; // Multiple IDs can be passed as a comma separated list.
  type?: 'program' | 'clip' | 'tvcontent' | 'tvprogram' | 'tvclip' | 'radiocontent' | 'radioprogram' | 'radioclip';
  q?: string;
  mediaobject?: 'audio' | 'video';
  category?: string; // Multiple IDs can be passed as a comma separated list.
  series?: string; // Multiple IDs can be passed as a comma separated list.
  availability?: 'ondemand' | 'future-ondemand' | 'future-scheduled' | 'in-future';
  downloadable?: 'true' | undefined;
  language?: 'fi' | 'sv';
  region?: 'fi' | 'world';
  service?: string; // Multiple service IDs can be passes as a comma separated list.
  publisher?: string;
  contentprotection?: string; // Multiple IDs can be passed as a comma separated list.
  order?: Order;
  limit?: number;
  offset?: number;
}

export interface ApiRequestProgramsNow {
  service?: string; // Multiple service IDs can be passes as a comma separated list.
  start?: number; // Allowed values range from -10 to 0. -1 means that the previous program will be included in the response.
  end?: number; // Allowed values range from 0 to 10. 1 means that the next program will be included in the response.
  mediaobject?: 'video' | 'audio';
}

export interface ApiResponseMediaPlayouts extends ApiResponse {
  data: MediaPlayout[];
}

export type PlayoutProtocol = 'HLS' | 'HDS' | 'PMD' | 'RTMPE';

export type Order =
  'playcount.6h:asc' |
  'playcount.6h:desc' |
  'playcount.24h:asc' |
  'playcount.24h:desc' |
  'playcount.week:asc' |
  'playcount.week:desc' |
  'playcount.month:asc' |
  'playcount.month:desc' |
  'publication.starttime:asc' |
  'publication.starttime:desc' |
  'publication.endtime:asc' |
  'publication.endtime:desc' |
  'updated:asc' |
  'updated:desc';
