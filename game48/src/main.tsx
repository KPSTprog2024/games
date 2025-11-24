import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import GameScreen from './GameScreen';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameScreen />
  </React.StrictMode>,
);
