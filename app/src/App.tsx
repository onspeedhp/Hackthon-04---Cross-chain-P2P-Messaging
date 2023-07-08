import './App.css';
import SolanaLogo from './logo.svg';
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
  } from '@solana/wallet-adapter-wallets'
import {
    WalletModalProvider,
    WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import Dashboard from './components/Dashboard';

require('@solana/wallet-adapter-react-ui/styles.css');

const Content = () => (
  <>
   <div className="h-full">
      <div className="pt-[20px] mr-[50px] flex justify-end">
        <WalletMultiButton
          style={{ backgroundColor: '#8B5CF6' }}
        />
      </div>
      <div className="flex flex-col items-center">
        <header className="mb-8 flex items-center justify-between">
          <img src={SolanaLogo} className="w-[150px] h-[100px] mt-5" alt="logo" />
        </header>
        <Dashboard />
      </div>
    </div>
  </>
);


function App() {

    const endpoint = "https://api.devnet.solana.com/";

    return (
        <div className="App bg-emerald-100 h-screen">
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
