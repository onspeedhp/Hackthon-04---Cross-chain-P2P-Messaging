import {
  IDL,
  NETWORK_URL,
  WORMHOLE_ETH_ABI,
  WORMHOLE_ETH_SM_ADDRESS,
} from "@/config/config";
import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import { createHellowormProgramInterface } from "@/needed";

interface sqData {
  data: number[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      msg: "Invalid method",
    });
  }

  try {
    const connection = new anchor.web3.Connection(
      anchor.web3.clusterApiUrl("devnet")
    );

    const programId = new anchor.web3.PublicKey(
      "GsTfE4Ndievuh8G5EWAPcS7aixwKyN5YdZNymq2cVfNV"
    );

    const program = createHellowormProgramInterface(connection, programId);

    const sequence = new anchor.web3.PublicKey(
      "6k4HrdhZdULGRrztGi4fGs5HrJkVjJ5FS5pz76muMLX6"
    );
    fetch("https://hackathon2023-rust.vercel.app/api/shyft/view", {
      method: "POST",
      body: JSON.stringify({ start: "hieu logs" }),
    });
    program.provider.connection.getAccountInfo(sequence).then((y) => {
      if (y !== null) {
        const numberSq = JSON.parse(JSON.stringify(y?.data)) as sqData;

        fetch("https://hackathon2023-rust.vercel.app/api/shyft/view", {
          method: "POST",
          body: JSON.stringify(numberSq),
        });

        getDataFromWormHole((numberSq.data[0] - 1).toString()).then(
          (result) => {
            console.log(result);
            if (result.vaaBytes !== undefined) {
              const hexString = `0x${Buffer.from(
                result.vaaBytes,
                "base64"
              ).toString("hex")}`;
              // console.log(hexString);
              fetch("https://hackathon2023-rust.vercel.app/api/shyft/view", {
                method: "POST",
                body: JSON.stringify({ hexString }),
              });

              const privateKey = process.env.PRIVATE_KEY_WALLET as string;
              const provider = new ethers.providers.JsonRpcProvider(
                NETWORK_URL
              );
              const signer = new ethers.Wallet(privateKey, provider);
              const contract = new ethers.Contract(
                WORMHOLE_ETH_SM_ADDRESS,
                WORMHOLE_ETH_ABI,
                signer
              );

              contract.receiveMessage(hexString).then((tx: any) => {
                tx.wait().then((txResult: any) =>
                  fetch(
                    "https://hackathon2023-rust.vercel.app/api/shyft/view",
                    {
                      method: "POST",
                      body: JSON.stringify({ txResult }),
                    }
                  )
                );
              });
            } else {
              console.log("con cai nit");
            }
          }
        );
      }
    });
    // console.log(y);
    // console.log(JSON.stringify(y?.data));

    // console.log();

    // console.log(BigInt(`0x${y?.data}`).toString());
  } catch (error) {
    console.log("exc", error);
  }
  return res.status(200).send("Finished");
}

export interface WormholeResProps {
  vaaBytes: string | undefined;
}
async function getDataFromWormHole(
  sequence: string
): Promise<WormholeResProps> {
  const url = `https://wormhole-v2-testnet-api.certus.one/v1/signed_vaa/1/48f36f42900d19f2c974355483d9fb397907481c344904bc2c56bd659890d867/${sequence}`;
  const response = await fetch(url, {
    method: "GET",
  });
  const result = await response.json();
  return result;
}
