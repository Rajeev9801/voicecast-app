/**
 * PRODUCTION VOICE COMMAND DEFINITIONS
 */

export const getCommands = (navigate, voicePlayer) => [
  {
    phrases: ["play", "resume", "start music", "chalao", "bajao"],
    action: () => {
      console.log("ACTION: PLAY");
      voicePlayer?.play();
    }
  },
  {
    phrases: ["pause", "stop music", "roko", "band karo"],
    action: () => {
      console.log("ACTION: PAUSE");
      voicePlayer?.pause();
    }
  },
  {
    phrases: ["next", "next podcast", "skip", "agla"],
    action: () => {
      console.log("ACTION: NEXT");
      voicePlayer?.next();
    }
  },
  {
    phrases: ["previous", "go back", "pichla", "peeche"],
    action: () => {
      console.log("ACTION: PREVIOUS");
      voicePlayer?.previous();
    }
  },
  {
    phrases: ["open home", "go home", "home", "ghar jao"],
    action: () => {
      console.log("ACTION: NAV HOME");
      voicePlayer?.navigate("/", "Opening home");
    }
  },
  {
    phrases: ["open search", "search podcasts", "search kholo"],
    action: () => {
      console.log("ACTION: NAV SEARCH");
      voicePlayer?.navigate("/search", "Opening search");
    }
  },
  {
    phrases: ["open library", "your library", "library kholo"],
    action: () => {
      console.log("ACTION: NAV LIBRARY");
      voicePlayer?.navigate("/library", "Opening library");
    }
  },
  {
    phrases: ["open recording studio", "studio kholo", "recording studio"],
    action: () => {
      console.log("ACTION: NAV RECORD");
      voicePlayer?.navigate("/record", "Opening recording studio");
    }
  },
  {
    phrases: ["open dashboard", "dashboard kholo"],
    action: () => {
      console.log("ACTION: NAV DASHBOARD");
      voicePlayer?.navigate("/dashboard", "Opening dashboard");
    }
  },
  {
    phrases: ["open admin panel", "admin panel", "admin kholo"],
    action: () => {
      console.log("ACTION: NAV ADMIN");
      voicePlayer?.navigate("/admin/login", "Opening admin panel");
    }
  },
  {
    phrases: ["volume up", "awaz badhao", "tez karo"],
    action: () => {
      console.log("ACTION: VOL UP");
      voicePlayer?.volumeUp();
    }
  },
  {
    phrases: ["volume down", "awaz kam karo", "dheere karo"],
    action: () => {
      console.log("ACTION: VOL DOWN");
      voicePlayer?.volumeDown();
    }
  },
  {
    phrases: ["start recording"],
    action: () => {
      console.log("ACTION: RECORD START");
      window.dispatchEvent(new CustomEvent("voice-record-start"));
      voicePlayer?.speak("Starting recording");
    }
  },
  {
    phrases: ["stop recording"],
    action: () => {
      console.log("ACTION: RECORD STOP");
      window.dispatchEvent(new CustomEvent("voice-record-stop"));
      voicePlayer?.speak("Stopping recording");
    }
  },
  {
    phrases: ["publish recording", "publish podcast"],
    action: () => {
      console.log("ACTION: RECORD PUBLISH");
      window.dispatchEvent(new CustomEvent("voice-record-save"));
      voicePlayer?.speak("Publishing podcast");
    }
  },
  {
    phrases: ["open liked songs", "liked songs"],
    action: () => {
      console.log("ACTION: NAV LIKED");
      voicePlayer?.navigate("/liked", "Opening liked songs");
    }
  }
];
