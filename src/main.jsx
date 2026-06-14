import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={clientId}
    >
      <MantineProvider>
        <App />
      </MantineProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);