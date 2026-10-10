import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './insights.css';

class AppBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false, message: '' }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Factory experience failed to render:', error); this.setState({ message: error.message }); }
  render() {
    if (this.state.failed) return <main style={{minHeight:'100vh',display:'grid',placeContent:'center',gap:16,padding:24,background:'#0b1114',color:'#eef1e9',fontFamily:'monospace'}}><strong>THE FACTORY EXPERIENCE COULD NOT START</strong><span>Use a current browser with WebGL enabled, or read about the engineering below.</span><code>{this.state.message}</code><a href="#specs" style={{color:'#59d6df'}}>EXPLORE THE ENGINEERING ↓</a></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppBoundary><App /></AppBoundary></React.StrictMode>);
