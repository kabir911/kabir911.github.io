import React, { useState } from 'react';
import SoftPhone from 'react-softphone';

export default function useVoice() {
  // State to control softphone visibility
  const [softPhoneOpen, setSoftPhoneOpen] = useState(false);
  
  // Your SIP server configuration
  const sipConfig = {
    domain: '://fonoster',        // Your SIP domain
    // uri: 'sip:your-extension@your-sip-server.com',  // Your SIP URI
    user: 'agent101',
    password: 'your-sip-password',        // Your SIP password
    ws_servers: 'ws://localhost:5063/ws', // WebSocket server
    display_name: 'WebRTC User',            // Display name for calls
    debug: false,                         // Set to true for debugging
    session_timers_refresh_method: 'invite'
  };

  // Settings state with localStorage persistence
  const [callVolume, setCallVolume] = useState(() => {
    const saved = localStorage.getItem('softphone-call-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  
  const [ringVolume, setRingVolume] = useState(() => {
    const saved = localStorage.getItem('softphone-ring-volume');
    return saved ? parseFloat(saved) : 0.6;
  });
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('softphone-notifications');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [connectOnStart, setConnectOnStart] = useState(() => {
    const saved = localStorage.getItem('softphone-connect-on-start');
    return saved ? JSON.parse(saved) : false;
  });

  // Functions to save settings (implement localStorage if needed)
  const saveConnectOnStart = (value) => {
    setConnectOnStart(value);
    localStorage.setItem('softphone-connect-on-start', value);
  };

  const saveNotifications = (value) => {
    setNotifications(value);
    localStorage.setItem('softphone-notifications', value);
  };

  const saveCallVolume = (value) => {
    setCallVolume(value);
    localStorage.setItem('softphone-call-volume', value);
  };

  const saveRingVolume = (value) => {
    setRingVolume(value);
    localStorage.setItem('softphone-ring-volume', value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📞 My Softphone App</h1>
        <p>Click the button below to open the softphone</p>
        
        <button 
          onClick={() => setSoftPhoneOpen(true)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          📞 Open Softphone
        </button>

        <SoftPhone
          // Visibility control
          softPhoneOpen={softPhoneOpen}
          setSoftPhoneOpen={setSoftPhoneOpen}
          
          // Audio settings
          callVolume={callVolume}
          ringVolume={ringVolume}
          
          // Connection settings
          connectOnStart={connectOnStart}
          notifications={notifications}
          
          // SIP configuration
          config={sipConfig}
          
          // Settings callbacks
          setConnectOnStartToLocalStorage={saveConnectOnStart}
          setNotifications={saveNotifications}
          setCallVolume={saveCallVolume}
          setRingVolume={saveRingVolume}
          
          // Optional: Built-in floating launcher
          builtInLauncher={true}
          launcherPosition="bottom-right"
          launcherSize="medium"
          launcherColor="primary"
          
          // Optional: Accounts for call transfer
          asteriskAccounts={[]}
          
          // Optional: Timezone for call history
          timelocale="UTC"
        />
      </header>
    </div>
  );
}
