/**
 * Command K Provider - Contexto para Command K
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CommandK } from './CommandK';

interface CommandKContextType {
  isOpen: boolean;
  openCommandK: () => void;
  closeCommandK: () => void;
  toggleCommandK: () => void;
}

const CommandKContext = createContext<CommandKContextType | undefined>(undefined);

interface CommandKProviderProps {
  children: ReactNode;
}

export function CommandKProvider({ children }: CommandKProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openCommandK = () => setIsOpen(true);
  const closeCommandK = () => setIsOpen(false);
  const toggleCommandK = () => setIsOpen(!isOpen);

  const value: CommandKContextType = {
    isOpen,
    openCommandK,
    closeCommandK,
    toggleCommandK,
  };

  return (
    <CommandKContext.Provider value={value}>
      {children}
      <CommandK open={isOpen} onOpenChange={setIsOpen} />
    </CommandKContext.Provider>
  );
}

export function useCommandK() {
  const context = useContext(CommandKContext);
  if (context === undefined) {
    throw new Error('useCommandK must be used within a CommandKProvider');
  }
  return context;
}
