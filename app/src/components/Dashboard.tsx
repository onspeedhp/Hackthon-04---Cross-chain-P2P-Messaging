import {  useAnchorWallet } from "@solana/wallet-adapter-react";
import {
    CHAIN_ID_SOLANA,
    getEmitterAddressSolana,
    parseSequenceFromLogSolana,
  } from '@certusone/wormhole-sdk';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createHellowormProgramInterface, createSendMessageInstruction } from '../needed';
import { Button } from 'antd';
import {ethers} from 'ethers';
import {
  WORMHOLE_ETH_ABI,
  WORMHOLE_ETH_SM_ADDRESS,
} from "../config";
import {Form, Input} from 'antd'
import { useState, useEffect } from "react";
import { Spin, Alert } from 'antd';


const ETH_NODE_URL ='wss://eth-goerli.g.alchemy.com/v2/flDa5U0m2g843wmEXbvI1bB-vfQ3omms';
const ETH_PRIVATE_KEY ='07bb8829d8dd4f2d92b6369e15945da6cbea4c1ddb38f2a2559282649c482279';

const WORMHOLE_RPC_HOST = 'https://wormhole-v2-testnet-api.certus.one';
const CORE_BRIDGE_PID = new PublicKey('3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5');

const Dashboard = () => {
   const wallet = useAnchorWallet();
   const connection = new Connection(clusterApiUrl('devnet'));
   const programId = new PublicKey('GsTfE4Ndievuh8G5EWAPcS7aixwKyN5YdZNymq2cVfNV');
   const program = createHellowormProgramInterface(connection, programId);
   const [txHash, setTxHash] = useState()
   const [isSuccess, setIsSuccess] = useState(false);


  const onFinish= (e: any) => {
    const messageTransfer: any = {
     from: e.from,
     to: e.to,
     tokenAddess: e.tokenAddress,
     amount: 10000000000000000000,
   };
    // const messageTransfer: any = {
    //   from: "0xFb4945F868f00de7aFA6aA2b73cea1D48c0E27A2",
    //   to: "0x86f93CdC9cD700C018AC0235D6eB249B38609A0f",
    //   tokenAddess: "0xec171F51676B62127a4BdfB145944cf8e6fDe08c",
    //   amount: 10000000000000000000,
    // };
   console.log("messageTransfer", messageTransfer)

   const jsonString = JSON.stringify(messageTransfer);
   let helloMessage = Buffer.from(jsonString, "utf8");
   helloMessage = Buffer.concat([
     Buffer.from(new Uint8Array([2])),
     helloMessage,
   ]);

    handleClick(helloMessage)
  }
  
  const handleClick = async (helloMessage:any) => {

    if (wallet !== undefined) {
      let transaction = new Transaction();
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

    transaction.feePayer = wallet.publicKey;
    transaction = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
    });
    console.log("Transaction id on solana", txid);

    await connection.confirmTransaction(txid);

    } else {
        console.log('Wallet is not defined.');
    }
  };



  return (
    <div className="w-1/2">
      <Form onFinish={onFinish} 
        initialValues={{from: "0xFb4945F868f00de7aFA6aA2b73cea1D48c0E27A2", 
                        to:"0x86f93CdC9cD700C018AC0235D6eB249B38609A0f", 
                        tokenAddress:"0xec171F51676B62127a4BdfB145944cf8e6fDe08c", 
                        amount:"10"  
        }}
        layout="vertical"
        >
        <Form.Item label="From" name="from">
          <Input placeholder="Ethereum Address of sender"></Input>
        </Form.Item>
        <Form.Item label="To" name="to">
          <Input placeholder="Ethereum Address of receiver" ></Input>
        </Form.Item>
        <Form.Item label="Token Address" name="tokenAddress">
          <Input placeholder="Ethereum Address of sender" ></Input>
        </Form.Item>
        <Form.Item label="Amount token transfer" name="amount">
          <Input placeholder="Ethereum Address of sender" ></Input>
        </Form.Item>
        <Form.Item >
          <Button block type="primary" htmlType="submit" className="bg-blue-500"> Send Message</Button>
        </Form.Item>
      </Form>
      {txHash && <div className="mb-[5px]">Transaction Hash: {txHash}</div>}
      {isSuccess ? <Alert message="Transaction successful !!!" type="success" /> : null}
    </div>
  );
};

export default Dashboard;
