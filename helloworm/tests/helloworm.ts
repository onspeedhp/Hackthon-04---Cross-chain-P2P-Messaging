import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey
} from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import {createInitializeInstruction, 
  createSendMessageInstruction, 
  deriveWormholeMessageKey, 
  createRegisterForeignEmitterInstruction, 
  getForeignEmitterData,
} from './needed';

const Web3 = require('web3');
import { Helloworm } from "../target/types/helloworm";
import {boilerPlateReduction, CORE_BRIDGE_PID} from "./hepler"
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import * as w from "@certusone/wormhole-sdk";
import { CHAINS } from "@certusone/wormhole-sdk";
import { deriveAddress} from "@certusone/wormhole-sdk/lib/cjs/solana";
import {ethers} from "ethers"
const connection = new Connection('https://api.devnet.solana.com');

const payer = Keypair.fromSecretKey(new Uint8Array([13,82,117,67,249,64,150,31,116,67,234,152,255,109,62,111,35,170,11,56,65,18,157,242,80,97,246,84,1,65,149,181,67,249,215,33,158,135,96,152,226,28,89,211,255,248,42,118,35,1,14,106,86,195,183,2,96,13,139,199,238,239,157,74]));

const program = anchor.workspace.Helloworm as Program<Helloworm>;

describe("helloworm", () => {

    anchor.setProvider(anchor.AnchorProvider.env());
    const realForeignEmitterAddress = Buffer.alloc(32, "deadbeef", "hex");
    const realForeignEmitterChain = CHAINS.ethereum;
    
    const {
        expectIxToSucceed,
      } = boilerPlateReduction(connection, payer);
      
    // it("Is initialized!", async () => {
    //     const createInitializeIx = () => createInitializeInstruction(
    //         connection,
    //         program.programId,
    //         payer.publicKey,
    //         CORE_BRIDGE_PID,
    //         );

    //     await expectIxToSucceed(createInitializeIx());
    // });
    
    [
        Buffer.alloc(32, "deadbeef", "hex"),
        realForeignEmitterAddress,
    ].forEach((emitterAddress) =>
    it(`Register ${emitterAddress === realForeignEmitterAddress ? "Final" : "Random"} Emitter`,
        async function() {
            await expectIxToSucceed(
                createRegisterForeignEmitterInstruction(
                connection,
                program.programId,
                payer.publicKey,
                realForeignEmitterChain,
                emitterAddress
                )
            );
    
            const {chain, address} = 
                await getForeignEmitterData(
                connection,
                program.programId,
                realForeignEmitterChain
                );

            console.log(chain, new PublicKey(address))

    })
    );

    type MessageTransfer = {
        from: ethers.Wallet["publicKey"],
        to: ethers.Wallet["publicKey"],
        tokenAddess: ethers.Wallet["publicKey"],
        amount: number,
    }
    
    const messageTransfer: MessageTransfer = {
      from: "0xef37accFeccB8da9233e576E6F3B35c3159E4d29",
      to: "0x86f93CdC9cD700C018AC0235D6eB249B38609A0f",
      tokenAddess: "0xec171F51676B62127a4BdfB145944cf8e6fDe08c",
      amount: 10000000000000000000
    }

    const [emitter, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("emitter")],
      program.programId,
    )
    console.log(emitter);

    const emitterAddressETH = w.getEmitterAddressSolana(program.programId);
    console.log(emitterAddressETH);

    const sequence = deriveAddress([Buffer.from("Sequence"), emitter.toBytes()], CORE_BRIDGE_PID)
    console.log(sequence);
    
    it("Finally Send Message", async function() {
        const jsonString = JSON.stringify(messageTransfer);
        let helloMessage = Buffer.from(jsonString, 'utf8');
        helloMessage = Buffer.concat([Buffer.from(new Uint8Array([2])), helloMessage]);
        // save message count to grab posted message later
        
        const sequence = (
          await wormhole.getProgramSequenceTracker(connection, program.programId, CORE_BRIDGE_PID)
        ).value() - 1n;

        console.log(sequence + 1n);

        await expectIxToSucceed(
            createSendMessageInstruction(
            connection,
            program.programId,
            payer.publicKey,
            CORE_BRIDGE_PID,
            helloMessage
            )
        );

        const messageKey = deriveWormholeMessageKey(program.programId, sequence);
        const {payload} =
            (await wormhole.getPostedMessage(
            connection,
            messageKey
            )).message;
        
        console.log(payload.toString())
      });
});
