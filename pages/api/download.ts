// pages/api/download.ts

import { NextApiRequest, NextApiResponse } from 'next';
import ytdl from '@distube/ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough, Readable } from 'stream';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

ffmpeg.setFfmpegPath(ffmpegPath!);

// Define the maximum duration in seconds (6 minutes = 360 seconds)
const MAX_VIDEO_DURATION_SECONDS = 6 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;
  const { userId } = getAuth(req);

  if (!videoUrl || !userId) {
    return res.status(400).json({ error: 'Video URL and user auth required' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    
    // --- VIDEO DURATION CHECK ---
    const videoDurationSeconds = parseInt(info.videoDetails.lengthSeconds, 10);

    if (isNaN(videoDurationSeconds) || videoDurationSeconds <= 0 || videoDurationSeconds > MAX_VIDEO_DURATION_SECONDS) {
      return res.status(400).json({ 
        error: `Video must be between 1 second and ${MAX_VIDEO_DURATION_SECONDS / 60} minutes long.` 
      });
    }
    // --- END VIDEO DURATION CHECK ---

    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    const filename = `${title}_${Date.now()}.mp3`;
    const videoId = info.videoDetails.videoId;

    const audioStream = ytdl(videoUrl, { quality: 'highestaudio' });
    const ffmpegStream = new PassThrough();

    ffmpeg(audioStream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Ensure headers are not sent twice if an error occurs mid-stream
        if (!res.headersSent) {
          res.status(500).json({ error: 'FFmpeg conversion failed' });
        }
      })
      .pipe(ffmpegStream);

    const buffer = await streamToBuffer(ffmpegStream);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('downloads')
      .upload(`${userId}/${filename}`, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (error || !data) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload MP3' });
    }

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/${userId}/${filename}`;

    // Insert metadata into table
    const { error: insertError } = await supabaseAdmin.from('downloaded_tracks').insert({
      user_id: userId,
      title: info.videoDetails.title,
      video_id: videoId,
      source_url: videoUrl,
      file_url: fileUrl,
    });

    if (insertError) {
      console.error('Metadata insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save metadata' });
    }

    return res.status(200).json({ success: true, path: data.path });
  } catch (err: any) { // Type 'err' as 'any' for better error handling, or 'unknown' and then narrow
    console.error('Download API error:', err);
    // Only send error response if headers haven't already been sent (e.g., by ffmpeg.on('error'))
    if (!res.headersSent) {
      if (err.message && err.message.includes('No video id found')) {
        return res.status(400).json({ error: 'Invalid YouTube URL or video not found.' });
      }
      // Handle other ytdl-core errors like "Video unavailable" etc.
      if (err.message && (err.message.includes('Video unavailable') || err.message.includes('Private video'))) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Failed to process download' });
    }
  }
}

// Helper to collect buffer
function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}