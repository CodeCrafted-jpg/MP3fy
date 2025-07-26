import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { playlistId } = await req.json();

    if (!playlistId) {
      return NextResponse.json({ error: 'Missing playlistId' }, { status: 400 });
    }

    const YOUTUBE_API_KEY = process.env.YT_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY in environment' }, { status: 500 });
    }

    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems`,
      {
        params: {
          part: 'snippet',
          playlistId,
          maxResults: 50,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('YouTube API Error:', err.response?.data || err.message);
    return NextResponse.json(
      { error: 'Failed to fetch playlist items', details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
