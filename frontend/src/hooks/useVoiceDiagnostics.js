import { useState, useEffect, useCallback } from 'react';

export const useVoiceDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    browserSupported: false,
    micAvailable: false,
    permissionStatus: 'unknown', // 'granted', 'denied', 'prompt'
    error: null,
    details: {}
  });

  const runDiagnostics = useCallback(async () => {
    const results = {
      browserSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      micAvailable: false,
      permissionStatus: 'unknown',
      details: {
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        isSecure: window.isSecureContext
      }
    };

    try {
      // 1. Check MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('MediaDevices API not supported');
      }

      // 2. Check for Audio Inputs
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      results.micAvailable = audioInputs.length > 0;
      results.details.deviceCount = audioInputs.length;
      results.details.devices = audioInputs.map(d => d.label || 'Unnamed Device');

      // 3. Check Permissions (Permissions API)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' });
          results.permissionStatus = status.state;
          status.onchange = () => {
            setDiagnostics(prev => ({ ...prev, permissionStatus: status.state }));
          };
        } catch (e) {
          results.details.permissionsApiError = e.message;
        }
      }

      // 4. Test getUserMedia (The real test)
      const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isSecure) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          results.permissionStatus = 'granted';
          // Clean up stream immediately
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          results.permissionStatus = 'denied';
          results.error = `Microphone access error: ${err.name}`;
          results.details.getUserMediaError = err.message;
        }
      } else {
        results.error = 'Insecure context: Microphone requires HTTPS or localhost';
      }

    } catch (err) {
      results.error = err.message;
    }

    setDiagnostics(results);
    return results;
  }, []);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      await runDiagnostics();
      return true;
    } catch (err) {
      setDiagnostics(prev => ({ 
        ...prev, 
        permissionStatus: 'denied',
        error: `Permission request failed: ${err.message}` 
      }));
      return false;
    }
  };

  return {
    ...diagnostics,
    runDiagnostics,
    requestPermission
  };
};
