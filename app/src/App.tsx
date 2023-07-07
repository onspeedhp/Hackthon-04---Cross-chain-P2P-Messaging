import './App.css';
import SolanaLogo from './logo.svg';
import { ConnectionProvider, useAnchorWallet, WalletProvider } from "@solana/wallet-adapter-react";
import {
    CHAIN_ID_SOLANA,
    getEmitterAddressSolana,
    parseSequenceFromLogSolana,
  } from '@certusone/wormhole-sdk';
import {
    PhantomWalletAdapter,
  } from '@solana/wallet-adapter-wallets'
import {
    WalletModalProvider,
    WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { createHellowormProgramInterface, createSendMessageInstruction } from './needed';
import { Button } from 'antd';

require('@solana/wallet-adapter-react-ui/styles.css');

const Dashboard = () => {
    const wallet = useAnchorWallet()
    const WORMHOLE_RPC_HOST = 'https://wormhole-v2-testnet-api.certus.one';
  const CORE_BRIDGE_PID = new PublicKey(
    '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
  );

  const connection = new Connection(clusterApiUrl('devnet'));

  const programId = new PublicKey(
    'GsTfE4Ndievuh8G5EWAPcS7aixwKyN5YdZNymq2cVfNV'
  );
  const program = createHellowormProgramInterface(connection, programId);

  let transaction = new Transaction();
    if (wallet !== undefined) {
        const click = async () => {
            transaction.add(
                await createSendMessageInstruction(
                  connection,
                  program.programId,
                  wallet.publicKey,
                  CORE_BRIDGE_PID,
                  Buffer.from([1])
                )
              );
    
              transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;
        // sign, send, and confirm transaction
        transaction.feePayer = wallet.publicKey;
        transaction = await wallet.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: true,
          maxRetries: 5,
        });
        console.log("Transaction", txid);
        
        await connection.confirmTransaction(txid)
        await new Promise((r) => setTimeout(r, 3000));
        const info = await connection.getTransaction(txid);
        if (info != null) {
            const sequence = parseSequenceFromLogSolana(info);
            const emitterAddress = getEmitterAddressSolana(program.programId);
            
            const vaaURL = `${WORMHOLE_RPC_HOST}/v1/signed_vaa/${CHAIN_ID_SOLANA}/${emitterAddress}/${sequence}`;
            console.log('Searching for: ', vaaURL);
            let vaaBytes = await (await fetch(vaaURL)).json();
            while (!vaaBytes.vaaBytes) {
              console.log('VAA not found, retrying in 5s!');
              await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
              vaaBytes = await (await fetch(vaaURL)).json();
            }
            console.log(vaaBytes);
          } else {
            console.log("Info is null");
            
          }
        }
        return (
            <Button onClick={click}>
                Haha
            </Button>
        )
    } else {
        return(
            <><Button>
                Send Message
                </Button></>
        )
    }
    
  

    

//     if (!wallet.connected || !wallet.publicKey) return <></>

   
}

const Content = () =>
  <header className="App-header">
      <WalletMultiButton />
      <img src={SolanaLogo} className="App-logo" alt="logo" />
      <Dashboard/>
  </header>

function App() {

    const endpoint = "https://api.devnet.solana.com/";

    return (
        <div className="App">
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
