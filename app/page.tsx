"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { useState, useEffect } from "react";
import { PROGRAM_ID, getProgramAccounts, getProgram } from "./utils/program";
import { BN } from "@project-serum/anchor";

export default function Page() {
  const wallet = useWallet();

  const [sessionId, setSessionId] = useState<string>("");
  const [sessionAddr, setSessionAddr] = useState<string>("");

  const [betAmount, setBetAmount] = useState<number>(0);
  const [betSessionAddr, setBetSessionAddr] = useState<string>("");
  const [betSessionID, setBetSessionID] = useState<string>("");

  const [winnerPublicKey, setWinnerPublicKey] = useState<string>("");
  const [resolvingSessionAddr, setResolvingSessionAddr] = useState<string>("");
  const [resolvingSessionID, setResolvingSessionID] = useState<string>("");

  // const [accounts, setAccounts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // const connection = new Connection(clusterApiUrl("devnet"));

  // useEffect(() => {
  //   const fetchAccounts = async () => {
  //     try {
  //       const fetchedAccounts = await getProgramAccounts(connection);
  //       setAccounts([...fetchedAccounts]);
  //     } catch (err: any) {
  //       setError(err.message || "Error fetching program accounts");
  //     }
  //   };

  //   fetchAccounts();
  // }, [connection]);

  const createSession = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Connect your wallet first!");
      return;
    }

    if (sessionId == "") {
      alert("Enter a valid session ID");
      return;
    }

    const sessionAccount = Keypair.generate();

    try {
      const program = getProgram(wallet);

      const [sessionPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("session"),
          wallet.publicKey.toBuffer(),
          Buffer.from(sessionId),
        ],
        program.programId
      );

      const [escrowPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("escrow"),
          wallet.publicKey.toBuffer(),
          Buffer.from(sessionId),
        ],
        program.programId
      );

      await program.rpc.createSession(sessionId, {
        accounts: {
          session: sessionPda,
          escrow: escrowPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      setSessionAddr(wallet.publicKey.toString());
      alert(`Session created: ${sessionAccount.publicKey.toString()}`);
    } catch (error: any) {
      console.error("Error creating session:", error);
      alert(error.message || "Error creating session");
    }
  };

  const placeBet = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Connect your wallet first!");
      return;
    }

    if (!betSessionID) {
      alert("Please enter a valid session ID.");
      return;
    }

    if (!betSessionAddr) {
      alert("Please enter a valid Bet Session Address.");
      return;
    }

    const betSessionPublicKey = new PublicKey(betSessionAddr);

    try {
      const program = getProgram(wallet);
      const [sessionPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("session"),
          betSessionPublicKey.toBuffer(),
          Buffer.from(betSessionID),
        ],
        program.programId
      );

      const [escrowPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("escrow"),
          betSessionPublicKey.toBuffer(),
          Buffer.from(betSessionID),
        ],
        program.programId
      );

      await program.rpc.placeBet(new BN(betAmount), {
        accounts: {
          session: sessionPda,
          escrow: escrowPda,
          bettor: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      alert(`Bet of ${betAmount} lamports placed`);
    } catch (error: any) {
      console.error("Error placing bet:", error);
      alert(error.message || "Error placing bet");
    }
  };

  const resolveBet = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Connect your wallet first!");
      return;
    }

    if (!winnerPublicKey) {
      alert("Please enter a valid  winner public key.");
      return;
    }

    if (!resolvingSessionAddr) {
      alert("Please enter a valid Bet Session Address.");
      return;
    }

    if (!resolvingSessionID) {
      alert("Please enter a valid Bet Session ID.");
      return;
    }

    const resolvingBetSessionPublicKey = new PublicKey(resolvingSessionAddr);

    try {
      const program = getProgram(wallet);

      const [sessionPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("session"),
          resolvingBetSessionPublicKey.toBuffer(),
          Buffer.from(resolvingSessionID),
        ],
        program.programId
      );

      const [escrowPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("escrow"),
          resolvingBetSessionPublicKey.toBuffer(),
          Buffer.from(resolvingSessionID),
        ],
        program.programId
      );

      const winnerKey = new PublicKey(winnerPublicKey);

      await program.rpc.resolveBet(winnerKey, {
        accounts: {
          session: sessionPda,
          escrow: escrowPda,
          authority: wallet.publicKey,
          winner: winnerKey,
          systemProgram: SystemProgram.programId,
        },
      });
      alert(`Bet resolved for winner: ${winnerPublicKey}`);
    } catch (error: any) {
      console.error("Error resolving bet:", error);
      alert(error.message || "Error resolving bet");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">
        Betting Escrow dApp
      </h1>

      {/* Wallet connection button */}
      <div className="text-center mb-6">
        <WalletMultiButton className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 transition duration-200" />
      </div>

      {/* Display connected wallet address */}
      {wallet.connected && wallet.publicKey && (
        <p className="text-center text-green-600 font-semibold">
          Connected wallet: {wallet.publicKey.toBase58()}
        </p>
      )}

      {error && (
        <p className="text-center text-red-600 font-semibold mt-4">
          Error: {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Create session form */}
        <div className="flex flex-col items-center border p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create Session
          </h2>
          <input
            type="text"
            placeholder="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <button
            onClick={createSession}
            className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Create Session
          </button>
          <br />
          <div className="w-full text-left">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              <span className="text-gray-500">Session Address:</span>{" "}
              {sessionAddr}
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-4">
              <span className="text-gray-500">Session ID:</span> {sessionId}
            </p>
          </div>
        </div>

        {/* Place bet form */}
        <div className="flex flex-col items-center border p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Place Bet
          </h2>
          <input
            type="number"
            placeholder="Bet Amount"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <input
            type="string"
            placeholder="Bet Session Addr"
            value={betSessionAddr}
            onChange={(e) => setBetSessionAddr(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <input
            type="string"
            placeholder="Bet Session ID"
            value={betSessionID}
            onChange={(e) => setBetSessionID(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <button
            onClick={placeBet}
            className="mt-4 bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 transition duration-200"
          >
            Place Bet
          </button>
        </div>

        {/* Resolve bet form */}
        <div className="flex flex-col items-center border p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Resolve Bet
          </h2>
          <input
            type="text"
            placeholder="Winner Public Key"
            value={winnerPublicKey}
            onChange={(e) => setWinnerPublicKey(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <input
            type="text"
            placeholder="Resolving Session Address"
            value={resolvingSessionAddr}
            onChange={(e) => setResolvingSessionAddr(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <input
            type="string"
            placeholder="Resolving Session ID"
            value={resolvingSessionID}
            onChange={(e) => setResolvingSessionID(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <button
            onClick={resolveBet}
            className="mt-4 bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition duration-200"
          >
            Resolve Bet
          </button>
        </div>
      </div>
    </div>
  );
}
