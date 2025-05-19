'use client';

import { useState } from 'react';

interface PlayerNameInputProps {
  onSubmit: (name: string) => void;
  isConnected: boolean;
}

export default function PlayerNameInput({ onSubmit, isConnected }: PlayerNameInputProps) {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Nome muito curto');
      return;
    }
    
    if (name.trim().length > 20) {
      setError('Nome muito longo (máximo 20 caracteres)');
      return;
    }
    
    setError(null);
    onSubmit(name.trim());
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Entre na Sala de Bingo</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="playerName" className="block text-sm font-medium mb-1">
            Seu nome
          </label>
          <input
            type="text"
            id="playerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite seu nome para entrar"
            autoComplete="off"
            disabled={!isConnected}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={!isConnected}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isConnected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isConnected ? 'Entrar na Sala' : 'Conectando...'}
        </button>
      </form>
      
      {!isConnected && (
        <p className="text-center text-amber-500 dark:text-amber-400 mt-3 text-sm">
          Aguarde, conectando ao servidor...
        </p>
      )}
    </div>
  );
}