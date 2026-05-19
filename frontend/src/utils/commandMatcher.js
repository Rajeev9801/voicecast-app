/**
 * SIMPLE INTENT MATCHER
 * Maps transcripts to commands using keywords and fuzzy synonyms.
 */

const INTENTS = {
  NAVIGATE: 'NAVIGATE',
  PLAYBACK: 'PLAYBACK',
  VOLUME: 'VOLUME',
  MIC: 'MIC',
  SEARCH: 'SEARCH'
};

const synonymMap = {
  // Navigation
  home: { intent: INTENTS.NAVIGATE, payload: '/', msg: 'Going Home', keys: ['home', 'main', 'piche', 'peeche'] },
  search: { intent: INTENTS.NAVIGATE, payload: '/search', msg: 'Opening Search', keys: ['search', 'khojo', 'find', 'dhundo'] },
  library: { intent: INTENTS.NAVIGATE, payload: '/library', msg: 'Your Library', keys: ['library', 'collection', 'gane', 'gaane'] },
  playlist: { intent: INTENTS.NAVIGATE, payload: '/create-playlist', msg: 'Creating Playlist', keys: ['playlist', 'banao', 'create'] },
  liked: { intent: INTENTS.NAVIGATE, payload: '/liked-songs', msg: 'Liked Songs', keys: ['liked', 'favourite', 'pasand'] },

  // Playback
  play: { intent: INTENTS.PLAYBACK, action: 'play', keys: ['play', 'chalao', 'shuru', 'start', 'baja', 'bajao'] },
  pause: { intent: INTENTS.PLAYBACK, action: 'pause', keys: ['pause', 'stop', 'roko', 'band', 'thahro'] },
  next: { intent: INTENTS.PLAYBACK, action: 'next', keys: ['next', 'agla', 'skip', 'aage'] },
  prev: { intent: INTENTS.PLAYBACK, action: 'prev', keys: ['previous', 'pichla', 'back', 'piche'] },
  resume: { intent: INTENTS.PLAYBACK, action: 'resume', keys: ['resume', 'fir se', 'vapas'] },

  // Volume
  vol_up: { intent: INTENTS.VOLUME, action: 'up', keys: ['volume up', 'awaz badhao', 'tez karo', 'louder'] },
  vol_down: { intent: INTENTS.VOLUME, action: 'down', keys: ['volume down', 'awaz kam karo', 'dheere karo', 'quiet'] },
  mute: { intent: INTENTS.VOLUME, action: 'mute', keys: ['mute', 'chup', 'silent'] },
  unmute: { intent: INTENTS.VOLUME, action: 'unmute', keys: ['unmute', 'awaz kholo'] },
  max: { intent: INTENTS.VOLUME, action: 'max', keys: ['max volume', 'full volume'] },

  // Mic
  mic_on: { intent: INTENTS.MIC, action: 'on', keys: ['mic on', 'voice on', 'start listening', 'mic chalu karo', 'mic shuru karo'] },
  mic_off: { intent: INTENTS.MIC, action: 'off', keys: ['mic off', 'stop listening', 'chup ho jao', 'mic band karo'] }
};

export const matchCommand = (transcript) => {
  const text = transcript.toLowerCase().trim();
  if (!text) return null;

  // 1. Check for Activation/Mic commands first
  for (const key of synonymMap.mic_on.keys) {
    if (text.includes(key)) return { type: INTENTS.MIC, action: 'on', message: 'Voice Assistant Active' };
  }

  // 2. Check for Play [Name] specifically
  for (const key of synonymMap.play.keys) {
    if (text.startsWith(key) && text.length > key.length + 1) {
      const query = text.replace(key, '').trim();
      return { type: INTENTS.PLAYBACK, action: 'play_search', payload: query, message: `Playing ${query}` };
    }
  }

  // 2. Check for general keywords
  for (const entry of Object.values(synonymMap)) {
    if (entry.keys.some(k => text.includes(k))) {
      return { 
        type: entry.intent, 
        action: entry.action, 
        payload: entry.payload, 
        message: entry.msg || entry.message 
      };
    }
  }

  return null;
};
