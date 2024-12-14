"use client";

import "./globals.css";

// Solana Wallet Adapter
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";
import { NETWORK_RPC_URL } from "./utils/program";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Solana network configuration
  const network = WalletAdapterNetwork.Devnet;

  // Supported wallets
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <html lang="en">
      <body>
        <ConnectionProvider endpoint={NETWORK_RPC_URL}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
