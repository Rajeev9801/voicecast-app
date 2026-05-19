import React from 'react';
import { ShieldAlert, RefreshCw, XCircle, CheckCircle, Info } from 'lucide-react';

const VoiceDiagnosticsDialog = ({ diagnostics, onRetry, onRequestPermission, onClose }) => {
  if (!diagnostics) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="text-yellow-500" size={32} />
          <h2 className="text-2xl font-bold">Voice Diagnostics</h2>
        </div>

        <div className="space-y-4 mb-8">
          <DiagnosticItem 
            label="Browser Support" 
            status={diagnostics.browserSupported} 
            desc={diagnostics.browserSupported ? "Speech API Found" : "Not supported in this browser"} 
          />
          <DiagnosticItem 
            label="Microphone Hardware" 
            status={diagnostics.micAvailable} 
            desc={diagnostics.micAvailable ? `${diagnostics.details.deviceCount} device(s) found` : "No microphone detected"} 
          />
          <DiagnosticItem 
            label="Permission" 
            status={diagnostics.permissionStatus === 'granted'} 
            warning={diagnostics.permissionStatus === 'prompt'}
            desc={`Status: ${diagnostics.permissionStatus.toUpperCase()}`} 
          />
          
          {diagnostics.error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <p className="font-bold flex items-center gap-2 mb-1">
                <XCircle size={14} /> Error Detected
              </p>
              <p>{diagnostics.error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {diagnostics.permissionStatus !== 'granted' && (
            <button 
              onClick={onRequestPermission}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Request Microphone Access
            </button>
          )}
          
          <button 
            onClick={onRetry}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Re-run Diagnostics
          </button>

          <button 
            onClick={onClose}
            className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center gap-2">
          <Info size={12} />
          <span>Tip: Chrome or Edge are recommended for best voice support.</span>
        </div>
      </div>
    </div>
  );
};

const DiagnosticItem = ({ label, status, desc, warning }) => (
  <div className="flex items-start gap-3">
    {status ? (
      <CheckCircle className="text-green-500 mt-1" size={18} />
    ) : warning ? (
      <Info className="text-yellow-500 mt-1" size={18} />
    ) : (
      <XCircle className="text-red-500 mt-1" size={18} />
    )}
    <div>
      <p className="text-sm font-bold leading-tight">{label}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
    </div>
  </div>
);

export default VoiceDiagnosticsDialog;
