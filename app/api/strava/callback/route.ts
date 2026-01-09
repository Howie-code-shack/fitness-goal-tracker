import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    // User denied authorization
    return NextResponse.redirect(`${baseUrl}/?strava_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?strava_error=no_code`);
  }

  // Redirect to frontend with code to complete the flow
  return NextResponse.redirect(`${baseUrl}/strava/connect?code=${code}`);
}
