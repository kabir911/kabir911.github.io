import { 
  LiveKitRoom, 
  BarVisualizer, 
  VoiceAssistantControlBar,
  useVoiceAssistant,
  RoomAudioRenderer 
} from '@livekit/components-react';
import { useState } from 'react';

export default function UseVoice() {
  const [token, setToken] = useState('');

  // 1. Fetch a connection token from your backend when user clicks "Connect"
  const startCall = async () => {
    const res = await fetch('http://localhost:8082/api/token');
    const data = await res.json();
    setToken(data.token);
  };

  if (!token) {
    return <button onClick={startCall} className="voice-btn">Speak to Agent</button>;
  }

  return (
    // 2. The Room wrapper manages the WebRTC connection automatically
    <LiveKitRoom
      serverUrl="ws://localhost:7880"
      token={token}
      connect={true}
      audio={true} // Requests mic access immediately
      video={false}
    >
      <RoomAudioRenderer /> 
      <div className="elevenlabs-style-widget">
        {/* Animated wave that dances when audio is streaming */}
        <BarVisualizer /> 
        
        {/* Clean, open-source control bar for mute/disconnect buttons */}
        <VoiceAssistantControlBar />
      </div>
    </LiveKitRoom>
  );
}
