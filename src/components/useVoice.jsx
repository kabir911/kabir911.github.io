import { 
  LiveKitRoom, 
  BarVisualizer, 
  VoiceAssistantControlBar,
  useVoiceAssistant
} from '@livekit/components-react';
import { useState } from 'react';

export function VoiceWidget() {
  const [token, setToken] = useState<string | null>(null);

  // 1. Fetch a connection token from your backend when user clicks "Connect"
  const startCall = async () => {
    const res = await fetch('/api/get-livekit-token');
    const data = await res.json();
    setToken(data.token);
  };

  if (!token) {
    return <button onClick={startCall} className="voice-btn">Speak to Agent</button>;
  }

  return (
    // 2. The Room wrapper manages the WebRTC connection automatically
    <LiveKitRoom
      serverUrl="wss://your-livekit-server.com"
      token={token}
      connect={true}
      audio={true} // Requests mic access immediately
      video={false}
    >
      <div className="elevenlabs-style-widget">
        {/* Animated wave that dances when audio is streaming */}
        <BarVisualizer /> 
        
        {/* Clean, open-source control bar for mute/disconnect buttons */}
        <VoiceAssistantControlBar />
      </div>
    </LiveKitRoom>
  );
}
