import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://umferdin.is/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ RoadCondition { results { id condition { description code date } roads { name } } } }`
      }),
      // Cache for 5 minutes
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Road conditions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch road conditions' },
      { status: 500 }
    );
  }
}
