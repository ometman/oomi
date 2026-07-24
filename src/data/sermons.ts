import { getYouTubeVideoId } from '../lib/youtube';

export interface PublishedSermon {
  id: string;
  title: string;
  speaker: string;
  publishedAt: string;
  scripture?: string;
  scriptureReferences?: string[];
  series?: string;
  excerpt: string;
  thumbnail?: string;
  mediaUrl: string;
  audioUrl?: string;
  mediaType: 'WATCH' | 'LISTEN';
  duration?: string;
  viewCount?: number | string;
  likeCount?: number | string;
  commentCount?: number | string;
  published: boolean;
}

export interface SermonPlaceholder {
  id: string;
  label: string;
  title: string;
  guidance: string;
}

// These visible slots keep the page complete before real messages are available.
// Replace them progressively by adding approved records to `publishedSermons` below.
export const sermonPlaceholders: SermonPlaceholder[] = [
  {
    id: 'message-slot-1',
    label: 'Featured message',
    title: 'New teaching coming soon',
    guidance: 'The message title, speaker, date and Scripture will appear here.',
  },
  {
    id: 'message-slot-2',
    label: 'Message archive',
    title: 'Teaching placeholder',
    guidance: 'This slot will be replaced when another approved message is published.',
  },
  {
    id: 'message-slot-3',
    label: 'Message archive',
    title: 'Teaching placeholder',
    guidance: 'This slot will be replaced when another approved message is published.',
  },
];

// Add only ministry-approved messages with a working media URL.
// Engagement figures are editorial snapshots, not live YouTube API values.
export const publishedSermons: PublishedSermon[] = [
  {
    id: 'Grace-JP-2026',
    title: 'How grace is Frustrated',
    speaker: 'Pastor Joseph Prince',
    publishedAt: '2026-07-23',
    scripture: '2 Peter 2:20-22',
    scriptureReferences: ['Hebrews 11:1', 'Proverbs 19:21'],
    series: 'Grace for Purposeful Living',
    excerpt: 'Discover how biblical grace is God\'s favor for resting.',
    mediaUrl: 'https://youtu.be/2yibVgZxlI0',
    audioUrl: 'https://youtu.be/2yibVgZxlI0',
    mediaType: 'WATCH',
    duration: '31:40',
    viewCount: 334,
    likeCount: '2K',
    commentCount: 150,
    published: true,
  },
];

export function getPublishedSermons(): PublishedSermon[] {
  return publishedSermons
    .filter((sermon) => sermon.published && Boolean(getYouTubeVideoId(sermon.mediaUrl)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getLatestPublishedSermon(): PublishedSermon | undefined {
  return getPublishedSermons()[0];
}
