'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

export default function DownloadedPage() {
  const { user } = useUser()
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/track/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message);
      setTracks((prev) => prev.filter((t: any) => t.id !== id));
      alert('track deleted')
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Failed to delete track.');
    }
  };


  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks')
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Error fetching tracks')
        setTracks(json.data)
      } catch (err: any) {
        console.error('Fetch Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchTracks()
  }, [user])

  if (!user) return <div className="p-4 text-red-500"></div>
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Image src="/loading-circle.svg" alt="loader" width={70} height={70} />
      </div>
    )
  }
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold  bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent text-center">Your Downloads</h1>

      {tracks.length === 0 ? (
        <p className="text-gray-500">No downloaded songs yet.</p>
      ) : (
        tracks.map((track) => {
          // If already a full URL, use as-is. Otherwise build from file path.
          const audioUrl = track.file_url?.startsWith('http')
            ? track.file_url
            : `${supabaseBaseUrl}/storage/v1/object/public/downloads/${track.file_url}`

          return (
            <div
              key={track.id}
              className="rounded-xl border p-4 shadow-sm  space-y-2"
            >
              <h2 className="text-lg font-medium">{track.title}</h2>
               
              <audio
                controls
                className="w-full"
                src={audioUrl}
                onError={() =>
                  console.error(`Failed to load audio: ${audioUrl}`)
                }

              />
              <button
                onClick={() => handleDelete(track.id)}
                className="text-sm text-red-500 text-center"
              >
                delete
              </button>
             


            </div>
          )
        })
      )}
    </div>
  )
}
