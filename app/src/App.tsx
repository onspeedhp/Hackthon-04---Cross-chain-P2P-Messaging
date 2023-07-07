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
import {ethers} from 'ethers';
import {
  WORMHOLE_ETH_ABI,
  WORMHOLE_ETH_SM_ADDRESS,
} from "./config";


require('@solana/wallet-adapter-react-ui/styles.css');

const ETH_NODE_URL =
    'wss://eth-goerli.g.alchemy.com/v2/flDa5U0m2g843wmEXbvI1bB-vfQ3omms';
  const ETH_PRIVATE_KEY =
    '07bb8829d8dd4f2d92b6369e15945da6cbea4c1ddb38f2a2559282649c482279';

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

  const messageTransfer: any = {
    from: "0xFb4945F868f00de7aFA6aA2b73cea1D48c0E27A2",
    to: "0x86f93CdC9cD700C018AC0235D6eB249B38609A0f",
    tokenAddess: "0xec171F51676B62127a4BdfB145944cf8e6fDe08c",
    amount: 10000000000000000000,
  };

  const jsonString = JSON.stringify(messageTransfer);
  let helloMessage = Buffer.from(jsonString, "utf8");
  helloMessage = Buffer.concat([
    Buffer.from(new Uint8Array([2])),
    helloMessage,
  ]);

  let transaction = new Transaction();
    if (wallet !== undefined) {
        const click = async () => {
            transaction.add(
                await createSendMessageInstruction(
                  connection,
                  program.programId,
                  wallet.publicKey,
                  CORE_BRIDGE_PID,
                  helloMessage
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

            const privateKey = ETH_PRIVATE_KEY as string;
            const provider = new ethers.providers.WebSocketProvider(
              ETH_NODE_URL
            );
            const signer = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract(
              WORMHOLE_ETH_SM_ADDRESS,
              WORMHOLE_ETH_ABI,
              signer
            );

            const input = vaaBytes.vaaBytes
            const buffer = Buffer.from(input, "base64");
            const hexString = buffer.toString("hex");

            const newHexString = `0x${hexString}`

            console.log("newHexString", newHexString)

            contract.receiveMessage(newHexString).then((tx: any) => {
              tx.wait().then((txResult: any) =>(
                console.log("txResult",txResult)
              ));
            });
          } else {
            console.log("Info is null");
            
          }
        }
        return (
            <Button onClick={click}>
                Send Message
            </Button>
        )
    } else {
        return(
            <><Button>
                Send Message 2
            </Button></>
        )
    }
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
