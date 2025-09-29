// Fix: All type definitions were missing or not exported. This file now defines and exports all shared types for the application, resolving numerous import errors.
export type Page = 
  | 'SOURCE_GATHERING'
  | 'SOURCES_AND_NOTES'
  | 'WRITERS_ROOM'
  | 'VOICE_LAB'
  | 'PUBLISH'
  | 'ARCHIVE'
  | 'SETTINGS';

export interface Source {
  id: string;
  type: 'youtube' | 'news' | 'note';
  title: string;
  content: string;
  url: string;
  imageUrl: string;
  userNote: string;
  
  // News-specific
  publication?: string;
  publishedAt?: string;

  // YouTube-specific
  channelTitle?: string;
  channelId?: string;
  videoId?: string;
  viewCount?: string;
  
  // For other types, e.g. social posts
  author?: string;
}

export interface DialogueLine {
  id: string;
  speaker: 'Blake' | 'Allen';
  line: string;
}

export interface ScriptTopic {
  sourceId: string;
  title: string;
  conversation: DialogueLine[] | null;
}

export interface Script {
  intro: DialogueLine[];
  topics: ScriptTopic[];
  segues: DialogueLine[][];
  outro: DialogueLine[];
}

export interface PromoAssets {
    titles: string[];
    summary: string;
    tweet: string;
    instagramCaption: string;
}

export interface ArchivedEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  script: Script;
  promoAssets: PromoAssets | null;
  archivedAt: string;
}

export interface FavoriteChannel {
    id: string;
    name: string;
}

export interface SpeakerConfig {
  id: string;
  name: string;
  voice: string;
}

export interface TTSRequest {
  model: string;
  mode: 'single' | 'multi';
  styleInstructions: string;
  temperature: number;
  speakers: SpeakerConfig[];
  dialogue: { id: string; speakerId: string; line: string }[];
}