export const createRecognition = () => {
  const SpeechRecognition = window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("webkitSpeechRecognition NOT SUPPORTED");
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  return recognition;
};
