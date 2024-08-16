import React from 'react';
import ReactDOM from 'react-dom/client';
import { PeaqAgungTestnet } from '@particle-network/chains';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import App from './App';

import('buffer').then(({ Buffer }) => {
  window.Buffer = Buffer;
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthCoreContextProvider
      options={{
        projectId: process.env.REACT_APP_PROJECT_ID as string,
        clientKey: process.env.REACT_APP_CLIENT_KEY as string,
        appId: process.env.REACT_APP_APP_ID as string,
        erc4337: {
          name: "SIMPLE",
          version: "1.0.0"
        },
        wallet: {
          visible: true,
          customStyle: {
            supportChains: [PeaqAgungTestnet]
          }
        }
      }}
    >
      <App />
    </AuthCoreContextProvider>
  </React.StrictMode>
);