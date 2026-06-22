import { useState, useEffect } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  VoiceAssistantControlBar,
  useTracks,
  TrackToggle,
  useRoomContext,
  StartAudio,
  BarVisualizer,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import './LiveKitVoiceWidget.css'; // Add the CSS file below
import { useLang } from '../i18n/LanguageContext.jsx'

export default function LiveKitVoiceWidget({sessionId, setMessages, setLoading}) {
  // console.log('sessionId:', sessionId, 'setMessages:', setMessages);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t, lang } = useLang()

  const AgentVisualizerRow = () => {
    const tracks = useTracks([{ source: Track.Source.Microphone, updateOnly: true }]);
    const agentTrack = tracks.find((t) => t.participant.isAgent);

    return (
      <div className="lk-voice-visualizer-row">
        <span className="lk-voice-status-text">
          {agentTrack ? t('chat.agentListening') : t('chat.callingAgent') + "..."}
        </span>
        {agentTrack?.publication?.track ? (
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
  }
  

  const startConversation = async () => {
    setIsLoading(true);
    const payload = {
      language: lang,
      session_id: sessionId,
      room: "agent-room"
    };
    console.log('payload:', payload)
    try {
      // Replace with your real token api endpoint
      const res = await fetch(import.meta.env.VITE_LIVEKIT_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // 1. Idle / Off State (Fits right inside your chat UI)
  if (!connectionDetails) {
    return (
      <button 
        onClick={startConversation} 
        className={`lk-voice-embed-btn ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <div className="lk-voice-pulse-ring"></div>
        <svg className="lk-voice-mic-icon" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
        <span>{isLoading ? t('chat.connecting') : t('chat.callAgent')}</span>
      </button>
    );
  }
  
  const HangUpButton = () => {
    const room = useRoomContext();
    
    const handleDisconnect = async () => {
      if (room) {
        await room.disconnect(); // Gracefully drops WebRTC connection [1]
      }
    };

    return (
      <button onClick={handleDisconnect} className="lk-custom-hangup-btn" aria-label="Hang up call">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="lk-hangup-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.155-.44.01-1.274.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
        <span>{t('chat.hangup')}</span>
      </button>
    );
  }

  const VoiceboxChatReceiver = () => {
    const room = useRoomContext();

    useEffect(() => {

      if (!room) return;

      // Handle incoming data packets manually
      const handleDataReceived = (
        payload, 
        participant, 
        kind,
        topic
      ) => {
        // Filter specifically for your agent's text channel topic
        if (topic === 'lk-chat-topic') {
          try {
            // 1. Decode the binary byte array into a string
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(payload);
            
            // 2. Parse the string into a JavaScript object
            const parsedData = JSON.parse(jsonString);
            
            // 3. Append the message to your React state timeline          
            console.log("Agent Event:", jsonString);

            if (parsedData.type === 'agent_handoff') {
              setLoading(true);
            } else {
              setLoading(false);
              setMessages((prev) => [...prev, { role: parsedData.role, content: parsedData.content.join('') }]);
            }
          } catch (error) {
            console.error("Failed to parse incoming data packet:", error);
          }
        }
      };

      // Bind the listener to LiveKit room events
      room.on(RoomEvent.DataReceived, handleDataReceived);

      // Clean up the listener when the component unmounts
      return () => {
        room.off(RoomEvent.DataReceived, handleDataReceived);
      };
    }, [room]);

    return (<div></div>)
  }

  // 2. Connected/Active State (Transforms inside the same container footprint)
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
        {/* Compact Layout wrapper for internal elements */}
        <StartAudio label="Allow Agent Voice" /> 

        <div className="lk-voice-panel-body">          
          <AgentVisualizerRow />
          <VoiceAssistantControlBar controls={{ leave: true, mic: true }} />
          <HangUpButton />
          <VoiceboxChatReceiver />
        </div>
      </LiveKitRoom>
    </div>
  );
}
