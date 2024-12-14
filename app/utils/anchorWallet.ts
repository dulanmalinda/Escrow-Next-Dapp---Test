import { Wallet } from "@project-serum/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, PublicKey } from "@solana/web3.js";

export class AnchorWallet implements Wallet {
  private payerKeypair: Keypair;

  constructor(private wallet: WalletContextState) {
    // Generate a temporary Keypair to satisfy the `payer` requirement
    this.payerKeypair = Keypair.generate();
  }

  // Provide the payer's public key (use a dummy Keypair)
  get payer(): Keypair {
    return this.payerKeypair;
  }

  // Provide the connected wallet's public key
  get publicKey(): PublicKey {
    if (!this.wallet.publicKey) throw new Error("Wallet not connected");
    return this.wallet.publicKey;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.wallet.signTransaction) {
      throw new Error("signTransaction is not available");
    }
    return this.wallet.signTransaction(tx);
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.wallet.signAllTransactions) {
      throw new Error("signAllTransactions is not available");
    }
    return this.wallet.signAllTransactions(txs);
  }
}
