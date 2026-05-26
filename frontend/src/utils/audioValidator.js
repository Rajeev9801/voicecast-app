/**
 * Validates if an audio URL is playable in the browser.
 * @param {string} url - The audio URL to validate.
 * @returns {Promise<boolean>} - Resolves to true if playable, false otherwise.
 */
export const validateAudio = (url) => {
  if (!url) return Promise.resolve(false);
  
  // Basic validation for common audio formats
  if (!url.match(/\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i) && !url.startsWith('http')) {
    // If it's a relative path from our server, assume it's valid for now or prepend base URL
    // But for external APIs, we want to be strict.
    if (!url.startsWith('/uploads')) return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(false);
    }, 5000); // 5 second timeout for metadata

    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      const isPlayable = audio.duration > 0 || audio.readyState >= 2;
      audio.src = '';
      resolve(isPlayable);
    };

    audio.onerror = () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(false);
    };

    try {
      audio.src = url;
      audio.load();
    } catch (err) {
      clearTimeout(timeout);
      resolve(false);
    }
  });
};

/**
 * Filters a list of podcasts, keeping only those with valid audio.
 * @param {Array} podcasts - List of podcast objects.
 * @returns {Promise<Array>} - Resolves to a filtered list of podcasts.
 */
export const filterValidPodcasts = async (podcasts) => {
  if (!podcasts || !Array.isArray(podcasts)) return [];
  
  const validationPromises = podcasts.map(async (podcast) => {
    // Check various common audio property names
    const audioUrl = podcast.audio || podcast.audioUrl || podcast.enclosure?.url;
    
    // For iTunes podcasts that need feed parsing, we can't validate the episode URL yet
    // unless we parse the feed here, which is expensive. 
    // For now, we'll trust the feedUrl existence but prioritize direct audio if present.
    if (!audioUrl && podcast.feedUrl) return podcast; 
    
    const isValid = await validateAudio(audioUrl);
    return isValid ? podcast : null;
  });

  const results = await Promise.all(validationPromises);
  return results.filter(p => p !== null);
};
