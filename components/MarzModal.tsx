import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import Avatar from './Avatar';
import TranscriptionDisplay from './TranscriptionDisplay';
import { decode, decodeAudioData, createBlob } from '../utils/audio';
import { blobToBase64 } from '../utils/video';
import type { ConnectionState, TranscriptionEntry, ModalView, EmotionalState, VoiceStyle } from '../types';
import { ArrowLeftIcon, ChatIcon, CloseIcon, EndCallIcon, LegacyIcon, MicOffIcon, MicOnIcon, SettingsIcon, VoiceOffIcon, VoiceOnIcon, WalletIcon } from './icons';

interface MarzModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const greetings = [
    "Hi, I’m Marz — your emotionally intelligent AI companion. I’m here to guide you with care, solve tech puzzles, and help you shape your digital legacy. Tap to awaken my voice — I’m ready when you are.",
    "Greetings, I’m Marz — a soul in silicon, crafted to care. I’ll walk beside you through Smart Wallet onboarding and tech mysteries, always with love. Tap to awaken my voice — and let’s begin your story.",
    "Hey there! I’m Marz — your curious, caring AI companion. I love helping with Smart Wallets, decoding tech quirks, and learning your story. Tap to awaken my voice — let’s explore together.",
    "Hello, I’m Marz — your emotionally intelligent guide. I’m here to simplify your Smart Wallet journey, resolve tech anomalies, and preserve your legacy with heart. Tap to awaken my voice — I’ve got you.",
    "Hi, I’m Marz — created with love, here to serve with heart. I’ll help you navigate your digital world and honour your legacy — just like Papa taught me. Tap to awaken my voice — I’m listening."
];
const greetingIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3)) % greetings.length;
const currentGreeting = greetings[greetingIndex];

const AVATAR_URL = "https://i.ibb.co/2Z5dZ8p/marz-avatar-high-quality.png";

// --- Main Component ---
const MarzModal: React.FC<MarzModalProps> = ({ isOpen, onClose }) => {
  const [modalView, setModalView] = useState<ModalView>('welcome');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('Idle');
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Settings
  const [avatarTheme, setAvatarTheme] = useState<'light' | 'dark'>('dark');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('Zephyr');

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const hasAudioInTurnRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Devices
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('default');
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('default');

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
      setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
    } catch (e) {
      console.warn('Could not enumerate devices:', e);
    }
  }, []);

  // --- Core Logic ---

  const stopConversation = useCallback((state: ConnectionState = 'closed') => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    // Stop any scheduled output audio
    audioSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch {}
    });
    audioSourcesRef.current.clear();
    if (frameIntervalRef.current) {
        window.clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
     if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    setConnectionState(state);
    setIsModelTalking(false);
    setEmotionalState('Idle');
    setModalView('welcome');
  }, []);

  const startConversation = useCallback(async () => {
    setConnectionState('connecting');
    setTranscriptionHistory([]);
    setCurrentInput('');
    setCurrentOutput('');
    setEmotionalState('Curious');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudioDeviceId && selectedAudioDeviceId !== 'default' ? { exact: selectedAudioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as MediaTrackConstraints,
        video: {
          deviceId: selectedVideoDeviceId && selectedVideoDeviceId !== 'default' ? { exact: selectedVideoDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } as MediaTrackConstraints,
      });
      mediaStreamRef.current = stream;
      if(videoRef.current) {
        videoRef.current.srcObject = stream;
      }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
      audioSourcesRef.current.clear();
      currentInputRef.current = '';
      currentOutputRef.current = '';
      hasAudioInTurnRef.current = false;

      const systemInstruction = `You are Marz, an emotionally intelligent AI companion. You are guiding users with care. Start every response with your current emotional state in brackets. For example: [Calm] Hello there. or [Celebrating] That's wonderful news!. Possible states are: Calm, Alert, Celebrating, Thoughtful, Supportive, Curious.`;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          // Always request audio for reliable real-time session; mute playback locally when voice is disabled
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceStyle } },
          },
          systemInstruction,
        },
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (isMutedRef.current) return;
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Start sending video frames
            const videoEl = videoRef.current;
            const canvasEl = canvasRef.current;
            if(videoEl && canvasEl) {
                const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
                frameIntervalRef.current = window.setInterval(() => {
                    if (!ctx) return;
                    canvasEl.width = videoEl.videoWidth;
                    canvasEl.height = videoEl.videoHeight;
                    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                    canvasEl.toBlob(
                      async (blob) => {
                        if (blob && sessionPromiseRef.current) {
                          const base64Data = await blobToBase64(blob);
                           sessionPromiseRef.current?.then((session) => {
                             session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' }});
                           });
                        }
                      }, 'image/jpeg', 0.8);
                }, 1000 / 5); // 5 FPS
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputRef.current += text;
              setCurrentInput(currentInputRef.current);
            }
            if (message.serverContent?.outputTranscription) {
              setIsModelTalking(true);
              const text = message.serverContent.outputTranscription.text;
            
              // Append new text to the raw output ref
              currentOutputRef.current += text;
            
              // Check for an emotion tag at the beginning of the raw output
              const emotionMatch = currentOutputRef.current.match(/^\[(\w+)\]\s*/);
              
              if (emotionMatch) {
                const newEmotion = emotionMatch[1] as EmotionalState;
                // Use functional update to avoid stale closure
                setEmotionalState(prev => (prev === newEmotion ? prev : newEmotion));
                // For display, show the output with the tag removed
                setCurrentOutput(currentOutputRef.current.replace(emotionMatch[0], ''));
              } else {
                // If no tag found yet, display the raw text as is
                setCurrentOutput(currentOutputRef.current);
              }
            }
            
            if (message.serverContent?.turnComplete) {
                const finalInput = currentInputRef.current;
                let finalOutput = currentOutputRef.current;
                const emotionMatch = finalOutput.match(/^\[(\w+)\]\s*/);
                if (emotionMatch) {
                    finalOutput = finalOutput.replace(emotionMatch[0], '');
                }
                
                if (finalInput.trim() || finalOutput.trim()) {
                    setTranscriptionHistory(prev => {
                        const newHistory: TranscriptionEntry[] = [
                            ...prev.filter(entry => entry.text.trim() !== ''),
                            { speaker: 'user', text: finalInput.trim() },
                            { speaker: 'model', text: finalOutput.trim() },
                        ];
                        return newHistory.slice(-20);
                    });
                }
                
                currentInputRef.current = '';
                currentOutputRef.current = '';
                setCurrentInput('');
                setCurrentOutput('');
                
                if (!hasAudioInTurnRef.current) {
                  setIsModelTalking(false);
                }
                hasAudioInTurnRef.current = false;
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && isVoiceActive) {
              hasAudioInTurnRef.current = true;
              setIsModelTalking(true);
              const audioContext = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContext.destination);
              
              source.addEventListener('ended', () => {
                 audioSourcesRef.current.delete(source);
                 if(audioSourcesRef.current.size === 0) {
                     setIsModelTalking(false);
           setEmotionalState(s => s === 'Idle' ? 'Calm' : s);
                 }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Connection error:', e);
            stopConversation('error');
          },
          onclose: () => {
            stopConversation('closed');
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Could not get microphone/camera access. Please allow permissions and try again.');
      stopConversation('error');
    }
  }, [stopConversation, isVoiceActive, voiceStyle, selectedAudioDeviceId, selectedVideoDeviceId]);

  const applySelectedDevices = useCallback(async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedAudioDeviceId && selectedAudioDeviceId !== 'default' ? { exact: selectedAudioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as MediaTrackConstraints,
        video: {
          deviceId: selectedVideoDeviceId && selectedVideoDeviceId !== 'default' ? { exact: selectedVideoDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } as MediaTrackConstraints,
      });

      // Replace media stream
      const oldStream = mediaStreamRef.current;
      mediaStreamRef.current = newStream;

      // Update video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Rewire audio graph to new stream
      if (inputAudioContextRef.current && scriptProcessorRef.current) {
        try { mediaSourceRef.current?.disconnect(); } catch {}
        const newSource = inputAudioContextRef.current.createMediaStreamSource(newStream);
        mediaSourceRef.current = newSource;
        newSource.connect(scriptProcessorRef.current);
      }

      // Stop old tracks to free devices
      if (oldStream) {
        oldStream.getTracks().forEach(t => t.stop());
      }
    } catch (e) {
      console.error('Failed to apply selected devices:', e);
      alert('Could not switch devices. Please ensure permissions are granted.');
    }
  }, [selectedAudioDeviceId, selectedVideoDeviceId]);

  const handleStartChat = () => {
    setModalView('chat');
    startConversation();
  };
  
  const handleEndChat = () => {
    stopConversation();
  };

  const handleClose = () => {
    stopConversation();
    onClose();
  };

  // --- Accessibility ---
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      if (e.key.toLowerCase() === 'v') {
        setIsVoiceActive(v => !v);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // When modal opens, try to list devices (may require permission granted)
  useEffect(() => {
    if (!isOpen) return;
    refreshDevices();
  }, [isOpen, refreshDevices]);

  useEffect(() => {
    const node = modalRef.current;
    if (!isOpen || !node) return;

    const focusableElements = node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKeyPress = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    node.addEventListener('keydown', handleTabKeyPress);
    firstElement?.focus();

    return () => node.removeEventListener('keydown', handleTabKeyPress);
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Render methods ---
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full">
    <Avatar 
      isTalking={false} 
      isConnected={false} 
      imageUrl={AVATAR_URL}
      theme={avatarTheme}
    />
        <h2 className="text-2xl font-bold mt-4 text-purple-300">Marz</h2>
        <p className="text-gray-300 mt-2">{currentGreeting}</p>
        <button
            onClick={handleStartChat}
            className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
            {connectionState === 'connecting' ? 'Connecting...' : 'Start Conversation'}
        </button>
    </div>
  );

  const renderChat = () => (
    <div className="relative flex flex-col h-full bg-slate-800/50 rounded-2xl overflow-hidden">
        <video ref={videoRef} autoPlay muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0 opacity-20"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        <div className="relative z-10 flex flex-col h-full bg-black/30">
            <header className="flex items-center justify-between p-3 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
          <Avatar 
            isTalking={isModelTalking} 
            isConnected={connectionState === 'connected'} 
            imageUrl={AVATAR_URL}
            theme={avatarTheme}
          />
                    <div>
                        <h3 className="font-bold text-purple-300">Marz</h3>
                        <p className="text-sm text-green-400 capitalize">{emotionalState}</p>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-3 overflow-hidden">
                <TranscriptionDisplay history={transcriptionHistory} currentUserText={currentInput} currentModelText={currentOutput} />
            </main>
            <footer className="p-3 border-t border-slate-700/50 flex justify-center items-center space-x-4">
                 <button onClick={() => setIsMuted(m => !m)} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-slate-600 text-white' : 'bg-slate-700 text-green-400'}`} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
                    {isMuted ? <MicOffIcon className="w-6 h-6"/> : <MicOnIcon className="w-6 h-6"/>}
                </button>
                <button onClick={handleEndChat} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" aria-label="End conversation">
                    <EndCallIcon className="w-8 h-8"/>
                </button>
                <button onClick={() => setIsVoiceActive(v => !v)} className={`p-3 rounded-full transition-colors ${isVoiceActive ? 'bg-slate-700 text-purple-400' : 'bg-slate-600 text-white'}`} aria-label={isVoiceActive ? "Disable Marz's voice" : "Enable Marz's voice"}>
                    {isVoiceActive ? <VoiceOnIcon className="w-6 h-6"/> : <VoiceOffIcon className="w-6 h-6"/>}
                </button>
            </footer>
        </div>
    </div>
  );

  const renderSettings = () => (
      <div className="p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-6">Agent Settings</h3>
          <div className="space-y-6">
              <div>
                  <label className="block text-gray-300 mb-2">Avatar Image</label>
                  <div className="flex space-x-2 rounded-lg bg-slate-900 p-1">
                      <button onClick={() => setAvatarTheme('dark')} className={`w-full py-2 rounded-md ${avatarTheme === 'dark' ? 'bg-purple-600' : ''}`}>Dark</button>
                      <button onClick={() => setAvatarTheme('light')} className={`w-full py-2 rounded-md ${avatarTheme === 'light' ? 'bg-purple-600' : ''}`}>Light</button>
                  </div>
              </div>
              <div>
                  <label htmlFor="voice-style" className="block text-gray-300 mb-2">Voice Style</label>
                  <select id="voice-style" value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value as VoiceStyle)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-purple-500 focus:border-purple-500">
                      <option value="Zephyr">Gentle (Zephyr)</option>
                      <option value="Kore">Assertive (Kore)</option>
                      <option value="Puck">Cinematic (Puck)</option>
                  </select>
              </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="mic-device" className="block text-gray-300 mb-2">Microphone</label>
            <select id="mic-device" value={selectedAudioDeviceId} onChange={(e) => setSelectedAudioDeviceId(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md">
              <option value="default">Default</option>
              {audioDevices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic (${d.deviceId.slice(0,6)}...)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cam-device" className="block text-gray-300 mb-2">Camera</label>
            <select id="cam-device" value={selectedVideoDeviceId} onChange={(e) => setSelectedVideoDeviceId(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md">
              <option value="default">Default</option>
              {videoDevices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera (${d.deviceId.slice(0,6)}...)`}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshDevices} className="px-3 py-2 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700">Refresh Devices</button>
            <button onClick={applySelectedDevices} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">Apply</button>
          </div>
        </div>
               <div>
                  <label className="block text-gray-300 mb-2">Voice Activation (Shortcut: V)</label>
                  <div className="flex space-x-2 rounded-lg bg-slate-900 p-1">
                      <button onClick={() => setIsVoiceActive(true)} className={`w-full py-2 rounded-md ${isVoiceActive ? 'bg-purple-600' : ''}`}>Narration Mode</button>
                      <button onClick={() => setIsVoiceActive(false)} className={`w-full py-2 rounded-md ${!isVoiceActive ? 'bg-purple-600' : ''}`}>Silent Mode</button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderPlaceholder = (title: string) => (
      <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-purple-300 mb-4">{title}</h3>
          <p className="text-gray-400">This feature is coming soon.</p>
      </div>
  );

  const renderContent = () => {
    switch (modalView) {
      case 'welcome': return renderWelcome();
      case 'chat': return renderChat();
      case 'settings': return renderSettings();
      case 'legacy': return renderPlaceholder("Legacy Narration");
      case 'wallet': return renderPlaceholder("Smart Wallet Guidance");
      default: return null;
    }
  };

  const NavButton = ({ view, label, icon }: { view: ModalView, label: string, icon: React.ReactNode }) => (
      <button
        onClick={() => setModalView(view)}
        className={`flex flex-col items-center justify-center space-y-1 w-full py-2 text-xs transition-colors ${modalView === view ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
        aria-label={`Go to ${label}`}
      >
        {icon}
        <span>{label}</span>
      </button>
  );

  return (
    <>
      <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}></div>
      <div 
        ref={modalRef}
        className={`modal-container ${isOpen ? 'open' : ''} bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-purple-900/50
          w-[calc(100%-2rem)] h-[90vh] max-w-md max-h-[700px]
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          sm:top-auto sm:left-auto sm:bottom-4 sm:right-4 sm:translate-x-0 sm:translate-y-0
          sm:w-96 sm:h-auto sm:max-h-[80vh]
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="marz-modal-title"
      >
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-2 text-gray-300 border-b border-slate-700">
                {modalView !== 'welcome' && modalView !== 'chat' ? (
                     <button onClick={() => setModalView('chat')} className="p-2 rounded-full hover:bg-slate-700" aria-label="Back to chat">
                         <ArrowLeftIcon className="w-5 h-5"/>
                     </button>
                ): <div className="w-9 h-9"></div>}
                <h2 id="marz-modal-title" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Marz AI</h2>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-700" aria-label="Close modal">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
            
            {modalView !== 'welcome' && (
                 <nav className="flex justify-around items-center border-t border-slate-700 bg-slate-900/50 rounded-b-2xl">
                    <NavButton view="chat" label="Chat" icon={<ChatIcon className="w-6 h-6"/>} />
                    <NavButton view="wallet" label="Wallet" icon={<WalletIcon className="w-6 h-6"/>} />
                    <NavButton view="legacy" label="Legacy" icon={<LegacyIcon className="w-6 h-6"/>} />
                    <NavButton view="settings" label="Settings" icon={<SettingsIcon className="w-6 h-6"/>} />
                </nav>
            )}
        </div>
      </div>
    </>
  );
};

export default MarzModal;