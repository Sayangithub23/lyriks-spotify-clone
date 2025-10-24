// app/api/get-song/[id]/route.ts

import { NextResponse } from 'next/server';

// This function handles GET requests
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse('Song ID is required', { status: 400 });
  }

  // Check if it's a Deezer ID
  const isDeezer = String(id).startsWith('deezer-');
  
  if (!isDeezer) {
    // We are only proxying Deezer, not Supabase.
    // Supabase fetches should still be handled client-side with RLS.
    // Returning an error here as this endpoint is only for Deezer.
    return new NextResponse('Invalid song source', { status: 400 });
  }

  try {
    const trackId = id.replace('deezer-', '');
    const res = await fetch(`https://api.deezer.com/track/${trackId}`);

    if (!res.ok) {
      const errorData = await res.json();
      return new NextResponse(JSON.stringify(errorData), { status: res.status });
    }

    const data = await res.json();
    
    // Manually map the Deezer data to your Song type
    // This ensures your client gets the exact 'Song' object it expects
    const deezerSong = {
        id: `deezer-${data.id}`,
        title: data.title,
        author: data.artist.name,
        image_path: data.album.cover_medium,
        song_path: data.preview,
        created_at: data.release_date,
        source: 'deezer'
    };

    return NextResponse.json(deezerSong);

  } catch (error: any) {
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}