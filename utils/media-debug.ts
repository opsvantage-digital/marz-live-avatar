export interface MediaDeviceError {
  type: 'permission' | 'not-found' | 'constraint' | 'abort' | 'security' | 'unknown';
  message: string;
  troubleshooting: string[];
}

export interface MediaDeviceStatus {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraPermission: PermissionState | 'unknown';
  microphonePermission: PermissionState | 'unknown';
  isSecureContext: boolean;
  userAgent: string;
}

/**
 * Check media device availability and permissions
 */
export async function checkMediaDeviceStatus(): Promise<MediaDeviceStatus> {
  const status: MediaDeviceStatus = {
    hasCamera: false,
    hasMicrophone: false,
    cameraPermission: 'unknown',
    microphonePermission: 'unknown',
    isSecureContext: window.isSecureContext,
    userAgent: navigator.userAgent
  };

  try {
    // Check for navigator.mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported');
      return status;
    }

    // Try to get device list
    const devices = await navigator.mediaDevices.enumerateDevices();
    status.hasCamera = devices.some(device => device.kind === 'videoinput');
    status.hasMicrophone = devices.some(device => device.kind === 'audioinput');

    // Check permissions if available
    if ('permissions' in navigator) {
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        status.cameraPermission = cameraPermission.state;
        status.microphonePermission = micPermission.state;
      } catch (e) {
        console.warn('Permission query not supported:', e);
      }
    }
  } catch (error) {
    console.error('Error checking media device status:', error);
  }

  return status;
}

/**
 * Parse getUserMedia errors into user-friendly messages
 */
export function parseMediaError(error: any): MediaDeviceError {
  const errorName = error?.name || '';
  const errorMessage = error?.message || '';

  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return {
        type: 'permission',
        message: 'Camera and microphone access was denied.',
        troubleshooting: [
          'Click the camera/microphone icon in your browser\'s address bar',
          'Select "Always allow" for this site',
          'Refresh the page and try again',
          'Check if another application is using your camera/microphone'
        ]
      };

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        type: 'not-found',
        message: 'No camera or microphone was found.',
        troubleshooting: [
          'Make sure your camera and microphone are connected',
          'Check if they work in other applications',
          'Try refreshing the page',
          'Restart your browser'
        ]
      };

    case 'NotReadableError':
    case 'TrackStartError':
      return {
        type: 'constraint',
        message: 'Camera or microphone is already in use by another application.',
        troubleshooting: [
          'Close other video conferencing apps (Zoom, Teams, etc.)',
          'Close other browser tabs using camera/microphone',
          'Restart your browser',
          'Restart your computer if the issue persists'
        ]
      };

    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        type: 'constraint',
        message: 'Camera or microphone settings are not supported.',
        troubleshooting: [
          'Try using different camera/microphone devices',
          'Update your browser to the latest version',
          'Check camera/microphone drivers'
        ]
      };

    case 'AbortError':
      return {
        type: 'abort',
        message: 'Media access was interrupted.',
        troubleshooting: [
          'Try again',
          'Refresh the page',
          'Check if the device was disconnected'
        ]
      };

    case 'SecurityError':
      return {
        type: 'security',
        message: 'Media access blocked due to security restrictions.',
        troubleshooting: [
          'Make sure you\'re using HTTPS (not HTTP)',
          'Check if this site is blocked in your browser settings',
          'Try using a different browser',
          'Disable browser extensions that might block media access'
        ]
      };

    default:
      return {
        type: 'unknown',
        message: `Unknown error: ${errorMessage || errorName}`,
        troubleshooting: [
          'Refresh the page and try again',
          'Try using a different browser',
          'Check your internet connection',
          'Update your browser to the latest version'
        ]
      };
  }
}

/**
 * Request media permissions with better error handling
 */
export async function requestMediaPermissions(constraints: MediaStreamConstraints = { audio: true, video: true }): Promise<MediaStream> {
  try {
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      throw new Error('Media access requires HTTPS or localhost');
    }

    // Request media access
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log('Media permissions granted successfully');
    console.log('Audio tracks:', stream.getAudioTracks().length);
    console.log('Video tracks:', stream.getVideoTracks().length);
    
    return stream;
  } catch (error) {
    console.error('Media permission error:', error);
    throw error;
  }
}

/**
 * Test media devices functionality
 */
export async function testMediaDevices(): Promise<{
  audio: boolean;
  video: boolean;
  errors: string[];
}> {
  const result = { audio: false, video: false, errors: [] };

  try {
    // Test audio only
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    result.audio = audioStream.getAudioTracks().length > 0;
    audioStream.getTracks().forEach(track => track.stop());
  } catch (error) {
    result.errors.push(`Audio: ${error.message}`);
  }

  try {
    // Test video only
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    result.video = videoStream.getVideoTracks().length > 0;
    videoStream.getTracks().forEach(track => track.stop());
  } catch (error) {
    result.errors.push(`Video: ${error.message}`);
  }

  return result;
}

/**
 * Get detailed device information
 */
export async function getDetailedDeviceInfo(): Promise<{
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  hasPermissions: boolean;
}> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  
  // Check if we have device labels (indicates permissions granted)
  const hasPermissions = devices.some(device => device.label !== '');
  
  return {
    audioInputs: devices.filter(d => d.kind === 'audioinput'),
    videoInputs: devices.filter(d => d.kind === 'videoinput'),
    audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
    hasPermissions
  };
}