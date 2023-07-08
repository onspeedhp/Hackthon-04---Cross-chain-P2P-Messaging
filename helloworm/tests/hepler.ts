import {
    LAMPORTS_PER_SOL,
    Connection,
    TransactionInstruction,
    sendAndConfirmTransaction,
    Transaction,
    Signer,
    PublicKey,
  } from "@solana/web3.js";
  import {
    NodeWallet,
    postVaaSolana,
    signSendAndConfirmTransaction,
  } from "@certusone/wormhole-sdk/lib/cjs/solana";

import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import { CONTRACTS } from "@certusone/wormhole-sdk";
import { MockGuardians } from "@certusone/wormhole-sdk/lib/cjs/mock";
export const MOCK_GUARDIANS =
  new MockGuardians(0, ["cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0"]);

export const CORE_BRIDGE_PID = new PublicKey("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5");

export function boilerPlateReduction(connection: Connection, defaultSigner: Signer) {
    // for signing wormhole messages
    const defaultNodeWallet = NodeWallet.fromSecretKey(defaultSigner.secretKey);
  
    const payerToWallet = (payer?: Signer) =>
      !payer || payer === defaultSigner
      ? defaultNodeWallet
      : NodeWallet.fromSecretKey(payer.secretKey);
    
    const requestAirdrop = async (account: PublicKey) =>
      connection.confirmTransaction(
        await connection.requestAirdrop(account, 1000 * LAMPORTS_PER_SOL)
      );
    
    const guardianSign = (message: Buffer) =>
      MOCK_GUARDIANS.addSignatures(message, [0])
  
    const postSignedMsgAsVaaOnSolana = async (signedMsg: Buffer, payer?: Signer) => {
      const wallet = payerToWallet(payer);
      await postVaaSolana(
        connection,
        wallet.signTransaction,
        CORE_BRIDGE_PID,
        wallet.key(),
        signedMsg
      );
    }
  
    const sendAndConfirmIx = async (
      ix: TransactionInstruction | Promise<TransactionInstruction>,
      signers?: Signer[]
    ) =>
      sendAndConfirmTransaction(
        connection,
        new Transaction().add(await ix),
        signers ?? [defaultSigner],{
            skipPreflight: true,
        }
      );
    
    const expectIxToSucceed = async (
      ix: TransactionInstruction | Promise<TransactionInstruction>,
      signers?: Signer[]
    ) =>
      expect(sendAndConfirmIx(ix, signers)).to.be.fulfilled;
      // {try {await sendAndConfirmIx(ix, signers); expect(true);}
      //  catch (error: any) {console.log(`expectIxToSucceed failed: ${error}`); expect(false);}}
      
    
    const expectIxToFailWithError = async (
      ix: TransactionInstruction | Promise<TransactionInstruction>,
      errorMessage: string,
      signers?: Signer[],
    ) => {
      try {
        await sendAndConfirmIx(ix, signers);
      } catch (error: any) {
        if (!error.logs || !Array.isArray(error.logs)) {
          throw new Error(`Logs unexpectedly not found in error: ${error}`);
        }
  
        const logs = (error.logs as string[]).join("\n");
        // if (!logs.includes(errorMessage))
        //   console.log(`Couldn't find error '${errorMessage}' in logs: ${logs}`);
        expect(logs).includes(errorMessage);
        return;
      }
      expect.fail("Expected transaction to fail");
    }
  
    const expectTxToSucceed = async (
      tx: Transaction | Promise<Transaction>,
      payer?: Signer,
    ) => {
      const wallet = payerToWallet(payer);
      return expect(
        signSendAndConfirmTransaction(
        connection,
        wallet.key(),
        wallet.signTransaction,
        await tx,
      )).to.be.fulfilled;
    }
  
    return {
      requestAirdrop,
      guardianSign,
      postSignedMsgAsVaaOnSolana,
      expectIxToSucceed,
      expectIxToFailWithError,
      expectTxToSucceed,
    };
  }