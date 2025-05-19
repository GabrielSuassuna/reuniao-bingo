'use client';

import { useSocket } from '../contexts/SocketContext';
import { useEffect, useRef } from 'react';

export default function MarkHistory() {
  const { markHistory } = useSocket();
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when history updates
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [markHistory]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (markHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-3">Histórico de Marcações</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Nenhuma célula marcada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-3">Histórico de Marcações</h2>
      <div className="max-h-[250px] overflow-y-auto">
        <ul className="space-y-2">
          {markHistory.map((event, index) => (
            <li 
              key={index}
              className="border-b border-gray-100 dark:border-gray-700 pb-2 text-sm"
            >
              <span className="font-semibold">{event.playerName}</span> marcou{' '}
              <span className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                &quot;{event.cellText}&quot;
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                {formatTime(event.timestamp)}
              </span>
            </li>
          ))}
        </ul>
        <div ref={historyEndRef} />
      </div>
    </div>
  );
}