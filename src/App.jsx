import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Impressum from './pages/Impressum.jsx'
import Privacy from './pages/Privacy.jsx'
import ChatWidget from './components/ChatWidget';
import ElevenLabsWidget from './components/ElevenLabsWidget.jsx'
import UseVoice from './components/LiveKitVoiceWidget.jsx'

// Inject avatar chat button styles and animations
const injectAvatarStyles = () => {
  const styleId = "avatar-chat-button-styles";
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.innerText = `
      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transform: translateX(-50%) scale(1);
        }
        50% { 
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.5);
          transform: translateX(-50%) scale(1.05);
        }
      }
      .avatar-chat-button {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      .avatar-chat-button:hover {
        background-color: #0056b3 !important;
        box-shadow: 0 8px 24px rgba(0, 123, 255, 0.6) !important;
        transform: translateX(-50%) scale(1.1) !important;
      }
    `;
    document.head.appendChild(styleTag);
  }
};

// Scroll to top whenever the route (pathname) changes.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTry, setIsTry] = useState(false);

  const handleTry = () => {
    console.log('Toggling TRY!')
    setIsTry((prev) => !prev);
  };
  
  // Inject avatar chat button styles on mount
  useEffect(() => {
    injectAvatarStyles();        
  }, []);
  
   return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>        
      </main>      
      <Footer onTry={handleTry} currentStatus={isTry}/>
      {/*
      <ElevenLabsWidget />
      */}
      <ChatWidget/>
      {isTry && (
        <div>        
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          style={styles.floatingButton}
          className="avatar-chat-button"
          title="Chat with AI Avatar"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Avatar head */}
            <circle cx="12" cy="8" r="4" />
            {/* Avatar body/chat bubble */}
            <path d="M 6 18 Q 6 14 12 14 Q 18 14 18 18 L 18 20 Q 18 22 16 22 L 8 22 Q 6 22 6 20 Z" />
            {/* Chat indicator dots */}
            <circle cx="10" cy="18" r="1.5" fill="currentColor" />
            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
            <circle cx="14" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>      
        </div>
      )}

      {isOpen && (
        <div style={styles.iframeContainer}>
          <iframe src="https://embed.liveavatar.com/v1/06dd7551-b9b6-40a9-b877-f630f1f32962?orientation=horizontal" allow="microphone" title="LiveAvatar Embed" style="aspect-ratio: 16/9;"></iframe>          
        </div>
      )}
            
    </div>
  )
}

// Inline styles for quick setup
const styles = {
  pageContainer: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
  },
  floatingButton: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: '56px',
    height: '56px',
    padding: '0',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  iframeContainer: {
    position: 'fixed',
    bottom: '80px', // Sits right above the button
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: '50vw',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 999,
  },
};
