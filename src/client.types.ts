export type PublicationEventType = 'ScheduledTransmission' | 'OnDemandPublication';
export type PublicationEventTemporalStatus = 'currently' | 'in-future';
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

export interface Service {
  id: string;
}

export interface Tags {
  catalog: boolean;
}

export interface ContentProtection {
  id: string;
  type: 'ContentProtectionPolicy';
}

export interface Media {
  id: string;
  duration: string;
  contentProtection: ContentProtection[];
  available: boolean;
  downloadable: boolean;
  version: number;
  type: "VideoObject";
}

export interface ProgramPublicationEvent {
  tags: Tags;
  service: Service;
  publisher: Service[];
  startTime: string;
  temporalStatus: PublicationEventTemporalStatus;
  endTime?: string;
  type: PublicationEventType;
  duration?: string;
  region: 'Finland' | 'World';
  id: string;
  media?: Media;
  version: number;
}

type Language = 'fi' | 'sv';

export interface Format {
  inScheme: string;
  type: string;
  key: string;
}

export interface AV {
  language: Language[];
  format: Format[];
}

export interface Video extends AV {
  type: 'VideoTrack';
}

export interface Audio extends AV {
  type: 'AudioTrack';
}

export interface Program {
  description: LocalizedField;
  video: Video;
  typeMedia: string;
  creator: unknown;
  partOfSeason: unknown;
  partOfSeries: unknown;
  episodeNumber: number;
  interactions: unknown;
  indexDataModified: string;
  alternativeId: string[];
  type: string;
  duration: string;
  productionId: string;
  contentRating: unknown;
  title: LocalizedField;
  itemTitle: unknown;
  countryOfOrigin: string[];
  id: string;
  typeCreative: string;
  image: ProgramImage;
  audio: Audio[];
  originalTitle: unknown;
  publicationEvent: ProgramPublicationEvent[];
  collection: string;
  subject: unknown[];
  subtitling: unknown[];
}

export interface MediaPlayout {
  subtitles: any;
  protocol: PlayoutProtocol;
  multibitrate: boolean;
  formatOf: string;
  width: number;
  height: number;
  type: string;
  url: string;
  live: boolean;
  protectionType: string;
}

export interface ApiResponseProgram {
  apiVersion: string;
  meta: {
    id: string;
  }
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
  downloadable?: 'true';
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
