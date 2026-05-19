import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

let spotifyAccessToken = '';
let tokenExpirationTime = 0;

export const getSpotifyAccessToken = async () => {
  const now = Date.now();
  if (spotifyAccessToken && now < tokenExpirationTime) {
    return spotifyAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials missing in .env');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const response = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  spotifyAccessToken = response.data.access_token;
  tokenExpirationTime = now + response.data.expires_in * 1000;
  return spotifyAccessToken;
};

export const searchSpotifyPodcasts = async (query) => {
  const token = await getSpotifyAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/search`, {
    params: {
      q: query,
      type: 'show',
      market: 'US'
    },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data.shows.items.map(show => ({
    id: show.id,
    title: show.name,
    description: show.description,
    image: show.images[0]?.url,
    author: show.publisher,
    source: 'spotify'
  }));
};
