// program.ts

import { PublicKey, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import idl from "../idl/betting_system.json"; // Replace with the path to your program's IDL

function isValidBase58(input: string): boolean {
  try {
    bs58.decode(input);
    return true;
  } catch {
    return false;
  }
}

const PROGRAM_ID_STRING = "4GxMdQmv2EWppGsqpmtBTd9oTPKJxQaySPuGFSfKzCge";
const NETWORK_RPC_URL = "https://api.devnet.solana.com";

let PROGRAM_ID: PublicKey;
if (isValidBase58(PROGRAM_ID_STRING)) {
  PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);
} else {
  throw new Error(`Invalid PROGRAM_ID: ${PROGRAM_ID_STRING}`);
}

export async function getProgramAccounts(connection: Connection) {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log("Program Accounts:", accounts);
    return accounts;
  } catch (error) {
    console.error("Error fetching program accounts:", error);
    throw new Error("Failed to fetch program accounts");
  }
}

export function getProgram(wallet: WalletContextState): Program {
  if (!wallet || !wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  const provider = new AnchorProvider(
    new Connection(NETWORK_RPC_URL),
    wallet as any,
    AnchorProvider.defaultOptions()
  );

  return new Program(idl as Idl, PROGRAM_ID, provider);
}

export { PROGRAM_ID };

export { NETWORK_RPC_URL };
