import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export const searchGlobalPodcasts = async (query) => {
  try {
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: query,
        entity: 'podcast',
        limit: 50 // Increased from 10 to 50
      }
    });

    return response.data.results.map(item => ({
      id: `itunes-${item.collectionId}`,
      title: item.collectionName,
      description: item.primaryGenreName,
      image: item.artworkUrl600 || item.artworkUrl100,
      author: item.artistName,
      feedUrl: item.feedUrl,
      source: 'itunes'
    }));
  } catch (err) {
    console.error('iTunes Search Error:', err);
    return [];
  }
};

export const getTopPodcasts = async () => {
  try {
    // iTunes RSS generator for top 50 podcasts
    const response = await axios.get('https://itunes.apple.com/us/rss/toppodcasts/limit=50/json');
    const entries = response.data.feed.entry || [];

    return entries.map(entry => ({
      id: `itunes-${entry.id.attributes['im:id']}`,
      title: entry['im:name'].label,
      description: entry.category.attributes.label,
      image: entry['im:image'][2].label,
      author: entry['im:artist'].label,
      source: 'itunes',
      isTrending: true
    }));
  } catch (err) {
    console.error('Top Podcasts Error:', err);
    return [];
  }
};

export const getEpisodesFromFeed = async (feedUrl) => {
  try {
    const response = await axios.get(feedUrl);
    const result = await parseStringPromise(response.data);
    
    const channel = result.rss.channel[0];
    const items = channel.item || [];

    return items
      .map((item, index) => {
        // Find the audio enclosure
        const enclosure = item.enclosure ? item.enclosure[0].$ : null;
        const audioUrl = enclosure ? enclosure.url : '';

        return {
          id: `ep-${index}-${Date.now()}`,
          title: item.title ? item.title[0] : `Episode ${index + 1}`,
          description: item.description ? item.description[0] : '',
          audio: audioUrl,
          audioUrl: audioUrl,
          pub_date_ms: item.pubDate ? new Date(item.pubDate[0]).getTime() : Date.now(),
        };
      })
      .filter(ep => ep.audioUrl && ep.audioUrl.trim() !== '')
      .slice(0, 10);
  } catch (err) {
    console.error('RSS Feed Parse Error:', err);
    return [];
  }
};
