import './App.css';
import SolanaLogo from './logo.svg';
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import Dashboard from './components/Dashboard';
import { Button, Image } from 'antd';
import { useState } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

const Content = () => {
  const wallet = useAnchorWallet();
  const description = 'This is a description.';
  const [process, useProcess] = useState(0);
  return (
    <>
      <div className='h-screen'>
        <div className='pt-[20px] mr-[50px] flex justify-end'>
          <WalletMultiButton style={{ backgroundColor: '#8B5CF6' }} />
        </div>
        <br />
        {wallet !== undefined ? (
          <>
            <div className='flex flex-col items-center'>
              <header className='mb-8 flex items-center justify-between'>
                <img
                  src={SolanaLogo}
                  className='w-[150px] h-[100px] mt-5'
                  alt='logo'
                />
              </header>
              <Dashboard />
            </div>
          </>
        ) : (
          <>
            <div className='flex justify-center items-center w-full'>
            </div>
          </>
        )}
      </div>
    </>
  );
};

function App() {
  const endpoint = 'https://api.devnet.solana.com/';

  return (
    <div className='App bg-emerald-100 h-screen'>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[new PhantomWalletAdapter()]} autoConnect>
          <WalletModalProvider>
            <Content />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
