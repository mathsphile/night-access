'use client';

import { useApp } from '@/context/AppContext';
import WalletModal from './WalletModal';

export default function WalletModalWrapper() {
  const { isWalletModalOpen, closeWalletModal, connectWallet } = useApp();
  return (
    <WalletModal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
      onConnect={connectWallet}
    />
  );
}
