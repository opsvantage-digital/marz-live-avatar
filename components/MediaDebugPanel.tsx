import React, { useState, useEffect } from 'react';
import { 
  checkMediaDeviceStatus, 
  parseMediaError, 
  testMediaDevices, 
  getDetailedDeviceInfo,
  type MediaDeviceStatus 
} from '../utils/media-debug';

interface MediaDebugProps {
  onClose: () => void;
}

const MediaDebugPanel: React.FC<MediaDebugProps> = ({ onClose }) => {
  const [status, setStatus] = useState<MediaDeviceStatus | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check overall status
      const deviceStatus = await checkMediaDeviceStatus();
      setStatus(deviceStatus);

      // Test devices
      const testResults = await testMediaDevices();
      setTestResult(testResults);

      // Get device details
      const details = await getDetailedDeviceInfo();
      setDeviceInfo(details);
      
    } catch (err: any) {
      const mediaError = parseMediaError(err);
      setError(`${mediaError.message}\n\nTroubleshooting:\n${mediaError.troubleshooting.map(t => `• ${t}`).join('\n')}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIndicator = ({ label, value, isGood }: { label: string; value: any; isGood?: boolean }) => (
    <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
      <span className="text-gray-300">{label}:</span>
      <span className={`font-mono text-sm ${
        isGood === true ? 'text-green-400' : 
        isGood === false ? 'text-red-400' : 
        'text-yellow-400'
      }`}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-300">Media Device Diagnostics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Running diagnostics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <h3 className="text-red-300 font-semibold mb-2">Error Detected</h3>
              <pre className="text-red-200 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {status && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">System Status</h3>
                <div className="space-y-2">
                  <StatusIndicator 
                    label="Secure Context (HTTPS)" 
                    value={status.isSecureContext} 
                    isGood={status.isSecureContext}
                  />
                  <StatusIndicator 
                    label="Camera Available" 
                    value={status.hasCamera} 
                    isGood={status.hasCamera}
                  />
                  <StatusIndicator 
                    label="Microphone Available" 
                    value={status.hasMicrophone} 
                    isGood={status.hasMicrophone}
                  />
                  <StatusIndicator 
                    label="Camera Permission" 
                    value={status.cameraPermission} 
                    isGood={status.cameraPermission === 'granted'}
                  />
                  <StatusIndicator 
                    label="Microphone Permission" 
                    value={status.microphonePermission} 
                    isGood={status.microphonePermission === 'granted'}
                  />
                </div>
              </div>

              {testResult && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Device Tests</h3>
                  <div className="space-y-2">
                    <StatusIndicator 
                      label="Audio Test" 
                      value={testResult.audio ? 'Pass' : 'Fail'} 
                      isGood={testResult.audio}
                    />
                    <StatusIndicator 
                      label="Video Test" 
                      value={testResult.video ? 'Pass' : 'Fail'} 
                      isGood={testResult.video}
                    />
                  </div>
                  {testResult.errors.length > 0 && (
                    <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                      <h4 className="text-yellow-300 font-medium mb-1">Test Errors:</h4>
                      {testResult.errors.map((err: string, idx: number) => (
                        <p key={idx} className="text-yellow-200 text-sm">• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {deviceInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Available Devices</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-gray-300 font-medium">Audio Inputs ({deviceInfo.audioInputs.length})</h4>
                      {deviceInfo.audioInputs.map((device: MediaDeviceInfo, idx: number) => (
                        <div key={idx} className="text-sm text-gray-400 ml-4">
                          {device.label || `Microphone ${idx + 1} (${device.deviceId.slice(0, 8)}...)`}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-gray-300 font-medium">Video Inputs ({deviceInfo.videoInputs.length})</h4>
                      {deviceInfo.videoInputs.map((device: MediaDeviceInfo, idx: number) => (
                        <div key={idx} className="text-sm text-gray-400 ml-4">
                          {device.label || `Camera ${idx + 1} (${device.deviceId.slice(0, 8)}...)`}
                        </div>
                      ))}
                    </div>
                  </div>
                  {!deviceInfo.hasPermissions && (
                    <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600 rounded">
                      <p className="text-blue-200 text-sm">
                        Device names are hidden until permissions are granted. Click "Grant Permissions" to see device labels.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Browser Info</h3>
                <div className="text-sm text-gray-400 bg-slate-800 p-3 rounded">
                  {status.userAgent}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={runDiagnostics}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                  disabled={isLoading}
                >
                  Re-run Tests
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                      alert('Permissions granted! Re-running diagnostics...');
                      runDiagnostics();
                    } catch (err: any) {
                      const mediaError = parseMediaError(err);
                      alert(`Permission request failed:\n${mediaError.message}\n\n${mediaError.troubleshooting.join('\n')}`);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Grant Permissions
                </button>

                <button
                  onClick={() => {
                    const diagnosticData = {
                      status,
                      testResult,
                      deviceInfo,
                      timestamp: new Date().toISOString(),
                      url: window.location.href
                    };
                    
                    const dataStr = JSON.stringify(diagnosticData, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'media-diagnostics.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md"
                >
                  Export Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaDebugPanel;