export const parseVoiceCommand = (command, callbacks) => {
  if (!command || !command.trim()) return;

  const cmd = command.toLowerCase().trim();

  // NAVIGATION COMMANDS
  if (cmd === 'open home' || cmd === 'home' || cmd === 'go home') {
    callbacks.onNavigate?.('/');
    return;
  }

  if (cmd === 'open dashboard' || cmd === 'dashboard') {
    callbacks.onNavigate?.('/dashboard');
    return;
  }

  if (cmd === 'open admin' || cmd === 'admin') {
    callbacks.onNavigate?.('/admin');
    return;
  }

  if (cmd === 'open search' || cmd === 'search') {
    callbacks.onNavigate?.('/search');
    return;
  }

  if (cmd === 'open library' || cmd === 'library') {
    callbacks.onNavigate?.('/library');
    return;
  }

  if (cmd === 'logout') {
    callbacks.onLogout?.();
    return;
  }

  // PLAYBACK COMMANDS
  if (cmd === 'play podcast' || cmd === 'play') {
    callbacks.onPlay?.();
    return;
  }

  if (cmd === 'stop podcast' || cmd === 'stop' || cmd === 'pause') {
    callbacks.onStop?.();
    return;
  }

  if (cmd.startsWith('search ')) {
    const query = cmd.replace('search', '').trim();
    callbacks.onSearch?.(query);
    return;
  }

  if (cmd.startsWith('play ')) {
    const query = cmd.replace('play', '').trim();
    callbacks.onSearchAndPlay?.(query);
    return;
  }

  if (cmd.includes('next') || cmd.includes('skip')) {
    callbacks.onNext?.();
    return;
  }

  if (cmd.includes('previous') || cmd.includes('back')) {
    callbacks.onPrevious?.();
    return;
  }
};

export const getVoiceHint = () => {
  return `VOICE COMMANDS:

NAVIGATION:
  • open home
  • open dashboard
  • open admin
  • open search
  • open library
  • logout

PLAYBACK:
  • play podcast
  • stop podcast
  • next / skip
  • previous / back

SEARCH:
  • search [podcast name]
  • play [podcast name]`;
};
