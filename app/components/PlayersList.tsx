'use client';

import { useState } from 'react';
import { useSocket, Player } from '../contexts/SocketContext';

export default function PlayersList() {
  const { players } = useSocket();
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Toggle player card expansion
  const toggleExpand = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  if (players.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Nenhum jogador conectado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 max-h-[500px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-3">Jogadores Conectados ({players.length})</h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`
              border rounded-lg p-3 transition-all
              ${player.hasWon ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}
            `}
          >
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => toggleExpand(player.id)}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                <span className="font-medium">
                  {player.name}
                  {player.hasWon && (
                    <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                      👑 Vencedor!
                    </span>
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Cartela {player.boardSize}x{player.boardSize}
                <span className="ml-2">{expandedPlayers.has(player.id) ? '▼' : '▶'}</span>
              </div>
            </div>
            
            {expandedPlayers.has(player.id) && (
              <div className="mt-3">
                <div 
                  className="grid gap-1 mt-2 mx-auto" 
                  style={{ 
                    gridTemplateColumns: `repeat(${player.boardSize}, minmax(30px, 40px))` 
                  }}
                >
                  {player.boardData.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          border text-[8px] md:text-[10px] p-1 flex items-center justify-center rounded min-h-[30px] 
                          text-center overflow-hidden
                          ${player.markedCells[rowIndex][colIndex] ? 'bg-green-200 dark:bg-green-800' : 'bg-white dark:bg-gray-800'}
                        `}
                        title={cell}
                      >
                        <span className="line-clamp-2">{cell}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}