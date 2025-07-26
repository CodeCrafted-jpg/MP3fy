'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Image from 'next/image';

const Converter = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // This state is for playlist errors
  const [videos, setVideos] = useState<any[]>([]);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  // Add a new state for download-specific errors
  const [downloadError, setDownloadError] = useState<string>(''); 


  function extractPlaylistId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get('list');
    } catch {
      return null;
    }
  }

  const handleDownload = async (videoUrl: string, title: string, index: number) => {
    setDownloadingIndex(index); // start loading for this index
    setDownloadError(''); // Clear any previous download errors

    try {
      const response = await axios.post(
        '/api/download',
        { videoUrl },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title || 'audio'}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) { // Type 'err' as 'any' to easily access AxiosError properties
      console.error('Download error:', err);
      if (axios.isAxiosError(err) && err.response) {
        // If it's an Axios error with a response, try to get the specific error message
        // The server sends JSON, so we need to read it as text first for a blob responseType
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            setDownloadError(errorData.error || '❌ An unknown download error occurred.');
            alert(errorData.error || '❌ An unknown download error occurred.'); // Also show an alert
          } catch (parseError) {
            setDownloadError('❌ Failed to parse error message from server.');
            alert('❌ Failed to parse error message from server.');
          }
        };
        reader.readAsText(err.response.data); // Read the blob as text
      } else {
        // Handle other types of errors (network issues, etc.)
        setDownloadError('❌ Failed to download MP3 due to a network or unexpected error.');
        alert('❌ Failed to download MP3 due to a network or unexpected error.');
      }
    } finally {
      setDownloadingIndex(null); // stop loading
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setVideos([]); // Clear previous videos when submitting a new playlist
    setDownloadError(''); // Clear download error when fetching new playlist

    const playlistId = extractPlaylistId(input);
    if (!playlistId) {
      setError('❌ Invalid YouTube playlist URL');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/playlist', { playlistId });
      setVideos(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch playlist items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h1 className='font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent gap-1 items-center text-center text-3xl py-5 '>Paste Your Playlist URL</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Input
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your YouTube playlist URL"
            required
          />
          <Button
            type="submit"
            className=" bg-gradient-to-br from-violet-500 to-pink-500 hover:bg-blue-700 text-white"
          >
            {loading ? 
              <div className='flex items-center justify-center'> <Image src="/loading-circle.svg" alt="loader" width={40} height={40} /></div> :
              'Submit'}
          </Button>
        </div>
        {error && <p className="mt-2 text-center text-2xl text-red-500">{error}</p>}
      </form>

      {/* Display download-specific error here */}
      {downloadError && <p className="mt-4 text-center text-2xl text-red-500">{downloadError}</p>}

      {videos.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-500">
            Playlist Items:
          </h2>
          {videos.map((video, index) => {
            const videoId = video.snippet.resourceId.videoId;
            const title = video.snippet.title;
            const thumbnail = video.snippet.thumbnails?.medium?.url;
            // Corrected YouTube URL format
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`; 

            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-16 h-10 rounded"
                  />
                  <p className="text-sm ">{title}</p>
                </div>

                <button
                  onClick={() => handleDownload(youtubeUrl, title, index)}
                  disabled={downloadingIndex === index}
                  className={`px-4 py-2 rounded text-white ${downloadingIndex === index
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {downloadingIndex === index ? 'Downloading...' : 'Download MP3'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Converter;