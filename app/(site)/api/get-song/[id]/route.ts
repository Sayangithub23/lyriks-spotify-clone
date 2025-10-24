import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest, // <-- 1. Use NextRequest
  context: { params: Promise<{ id: string }> } // 2. Use context
) {
  const { id } = await context.params; // 3. Await context.params

  if (!id) {
    return new NextResponse('Song ID is required', { status: 400 });
  }

  const isDeezer = id.startsWith('deezer-');

  if (!isDeezer) {
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

  } catch (error) { // <-- 4. Fix for the 'any' error
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(errorMessage, { status: 500 });
  }
}