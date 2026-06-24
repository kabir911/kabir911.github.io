import { useState, useEffect } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useTracks,
  TrackToggle,
  useRoomContext,
  StartAudio,
  BarVisualizer,
  useMediaDevices, // Swapped for direct lists to completely remove nested dropdowns
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import './LiveKitVoiceWidget.css'; 
import { useLang } from '../i18n/LanguageContext.jsx';
import Toast from './Toast';
import Status from './Status.jsx';

export default function LiveKitVoiceWidget({sessionId, setMessages, setLoading}) {
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const [showSettings, setShowSettings] = useState(false); 
  const [agentState, setAgentState] = useState(t('initializing'));
  const [agentName, setAgentName] = useState('');
  const { t, lang } = useLang();
  const [toast, setToast] = useState({ message: '', type: 'success' });
  let toastTimer = null;

  const showToast = (message, type) => {
    setToast({ message, type });
    
    // Auto-dismiss after 3.5 seconds
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      setToast({ message: '', type: 'success' });
      toastTimer = null;
    }, 3500);
  };

  const AgentVisualizerRow = () => {
    const tracks = useTracks([{ source: Track.Source.Microphone, updateOnly: true }]);
    const agentTrack = tracks.find((t) => t.participant.isAgent);

    if (agentTrack && handedOff) {
      const room = useRoomContext();
        room.on(RoomEvent.ParticipantAttributesChanged, (changedAttributes, participant) => {
          // Check if the changed attribute belongs to the agent
          if (participant.identity === agentName) {
              const agentState = participant.attributes['lk.agent.state'];
              console.log("Native Agent State updated to:", agentState);
              // Output can be: "initializing", "idle", "listening", "thinking", "speaking"
              setAgentState(agentState);              
          }
      });
    }

    return (
      <div className="lk-voice-visualizer-row">
        <div className="lk-voice-status-text">
          <div className="flex-1 min-w-0">{(agentTrack ? (handedOff ? t('chat.agentListening') : t('chat.connectingAgent')) : t('chat.connectingAgent')) + "..."}</div>
          <Status status={(t('chat.' + agentState))}/>
        </div>
        {handedOff && agentTrack?.publication?.track ? (  
          <BarVisualizer 
            track={agentTrack.publication.track} 
            barCount={9}            
            options={{ gap: 4 }}
            className="lk-voice-bars"
          />
        ) : (
          <div className="lk-voice-loading-dots"><span></span><span></span><span></span></div>
        )}
      </div>
    );
  };

  const startConversation = async () => {
    setIsLoading(true);
    const payload = { language: lang, session_id: sessionId, room: "agent-room" };
    try {
      const res = await fetch(import.meta.env.VITE_LIVEKIT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setConnectionDetails({ url: import.meta.env.VITE_LIVEKIT_SERVER_URL, token: data.token });
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connectionDetails) {
    return (
      <button 
        onClick={startConversation} 
        className={`lk-voice-embed-btn ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <div className="lk-voice-mic-container">
          <div className="lk-voice-pulse-ring"></div>
          <svg className="lk-voice-mic-icon" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </div>        
        <span>{isLoading ? t('chat.connecting') : t('chat.callAgent')}</span>
      </button>
    );
  }
  
  const HangUpButton = () => {
    const room = useRoomContext();
    
    room.on(RoomEvent.ParticipantConnected, (participant) => {
        if (participant.identity && participant.identity.startsWith("agent-")) {
          console.log("Agent identity discovered:", participant.identity);
          setAgentName(participant.identity);
        } else {
          console.log('Participant event:', participant);
        }
    });

    const handleDisconnect = async () => {
      if (room) { await room.disconnect(); }
      setLoading(false);
      setConnectionDetails(null);
      setHandedOff(false);
    };

    return (
      <button onClick={handleDisconnect} className="lk-custom-hangup-btn" aria-label="Hang up call">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="lk-hangup-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.155-.44.01-1.274.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
        <span>{t('chat.hangup')}</span>
      </button>
    );
  };

  const DirectDeviceManager = () => {
    const room = useRoomContext();
    
    // Explicit permission requesting for hardware arrays
    const microphones = useMediaDevices({ "kind": "audioinput" }, { requestPermissions: true });
    const speakers = useMediaDevices({ "kind": "audiooutput" }, { requestPermissions: true });
    
    // Checks if the client browser supports the HTML5 Audio switch api (setSinkId)
    const supportsSpeakerSwitch = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

    const handleDeviceSelect = async (kind, deviceId) => {
      if (room) {
        try {
          console.log('switch', kind, deviceId);
          await room.switchActiveDevice(kind, deviceId);
          showToast(t('chat.deviceSwitched'), "success")          
        } catch (e) {
          showToast(e.message, "warning")
        }
      }
    };

    return (
      <div className="lk-device-manager-wrapper">
        {/* Microphones Section */}
        <div className="lk-device-section">
          <h5 className="lk-section-title">{t('chat.microphoneInput')}</h5>
          <div className="lk-custom-direct-list">
            {microphones.length === 0 ? (
              <div className="lk-no-devices">{t('chat.noMicrophone')}</div>
            ) : (
              microphones.map((device) => (
                <button
                  key={device.deviceId}
                  className="lk-custom-device-item"
                  onClick={() => handleDeviceSelect('audioinput', device.deviceId)}
                  title={device.label}
                >
                  <span className="lk-device-text-label">{device.label || t('chat.unknownMicrophone')}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Speakers Section */}
        <div className="lk-device-section">
          <h5 className="lk-section-title">{t('chat.speakerOutput')}</h5>
          {!supportsSpeakerSwitch && (
            <div className="lk-browser-warning">
              {t('chat.notSupported')}
            </div>
          )} 
          
          {supportsSpeakerSwitch && speakers.length === 0 && (
            <div className="lk-no-devices">{t('chat.defaultSpeaker')}</div>
          )}
          
          {supportsSpeakerSwitch && speakers.length > 0 && (
            <div className="lk-custom-direct-list">
              {speakers.map((device) => (
                <button
                  key={device.deviceId}
                  className="lk-custom-device-item"
                  onClick={() => handleDeviceSelect('audiooutput', device.deviceId)}
                  title={device.label}
                >
                  <span className="lk-device-text-label">{device.label || t('chat.unknownSpeaker')}</span>
                </button>
              ))}
            </div>          
          )}
        </div>
      </div>
    );
  };

  const VoiceboxChatReceiver = () => {
    const room = useRoomContext();
    useEffect(() => {
      if (!room) return;
      const handleDataReceived = (payload, participant, kind, topic) => {
        if (topic === 'lk-chat-topic') {
          try {
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(payload);
            const parsedData = JSON.parse(jsonString);
            if (parsedData.type === 'agent_handoff') {
              setHandedOff(true);
              setLoading(true);
            } else if (parsedData.type === 'message') {
              setMessages((prev) => [...prev, { role: parsedData.role, content: parsedData.content.join('') }]);
              setLoading(parsedData.role === 'user' ? true : false);
            } else {
              console.log('Unknown:', parsedData);              
            }
          } catch (error) {
            console.error("Failed to parse incoming data packet:", error);
          }
        }
      };
      room.on(RoomEvent.DataReceived, handleDataReceived);
      return () => { room.off(RoomEvent.DataReceived, handleDataReceived); };
    }, [room]);

    return null;
  };

  return (
    <div className="lk-voice-active-panel">
      <LiveKitRoom
        serverUrl={connectionDetails.url}
        token={connectionDetails.token}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={() => setConnectionDetails(null)}
        className="lk-my-room-container"
      >
        <RoomAudioRenderer />
        <StartAudio label="Allow Agent Voice" /> 

        <div className="lk-voice-panel-body">          
          <AgentVisualizerRow />
          
          <div className="lk-custom-control-bar">
            <HangUpButton />
            {handedOff && (              
              <TrackToggle source={Track.Source.Microphone} className="lk-custom-toggle-btn" />
            )}
            {handedOff && (              
              <div className="lk-settings-menu-container">
                <button 
                  className={`lk-custom-settings-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  aria-label="Toggle audio settings"
                >
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="lk-settings-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767a1.123 1.123 0 0 0-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 0 0 .417 1.03l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456a1.125 1.125 0 0 0-1.075.124a2.08 2.08 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.125 1.125 0 0 0-.646-.87a2.08 2.08 0 0 1-.22-.127a1.125 1.125 0 0 0-1.074-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.43l1.003-.767a1.122 1.122 0 0 0 .417-1.03a2.07 2.07 0 0 1-.006-.222c0-.074.002-.148.006-.222a1.122 1.122 0 0 0-.417-1.03l-1.003-.767a1.125 1.125 0 0 1-.26-1.43l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>

                {/* Secure Floating Popup */}
                {showSettings && (
                  <div className="lk-floating-device-menu">
                    <div className="lk-floating-menu-header">
                      <h4>{t('devices')}</h4>
                      <button onClick={() => setShowSettings(false)} className="lk-close-menu-btn">×</button>
                    </div>
                    <DirectDeviceManager />
                  </div>
                )}
              </div>              
            )}
          </div>

          <VoiceboxChatReceiver />
        </div>        
      </LiveKitRoom>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
    </div>
  );
}
