"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

// Types
export interface Player {
  id: string;
  name: string;
  boardSize: number;
  boardData: string[][];
  markedCells: boolean[][];
  hasWon: boolean;
}

export interface MarkEvent {
  playerId: string;
  playerName: string;
  row: number;
  col: number;
  cellText: string;
  timestamp: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  players: Player[];
  markHistory: MarkEvent[];
  currentPlayer: Player | null;
  joinRoom: (name: string, boardSize: number, boardData: string[][]) => void;
  markCell: (row: number, col: number, cellText: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  players: [],
  markHistory: [],
  currentPlayer: null,
  joinRoom: () => {},
  markCell: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [markHistory, setMarkHistory] = useState<MarkEvent[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      // Make sure socket server is running by fetching the API endpoint
      await fetch('/api/socket');
      
      const socketInstance = io({
        path: "/api/socket",
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      // Receive initial state when joining
      socketInstance.on("initialState", ({ players, markHistory }) => {
        setPlayers(players);
        setMarkHistory(markHistory);
      });

      // Player joined event
      socketInstance.on("playerJoined", (player: Player) => {
        setPlayers((prev) => {
          const existingPlayerIndex = prev.findIndex((p) => p.id === player.id);
          if (existingPlayerIndex !== -1) {
            // Update existing player
            const newPlayers = [...prev];
            newPlayers[existingPlayerIndex] = player;
            return newPlayers;
          } else {
            // Add new player
            return [...prev, player];
          }
        });

        // If this is our player, update currentPlayer
        if (player.id === socketInstance.id) {
          setCurrentPlayer(player);
        }
      });

      // Player left event
      socketInstance.on("playerLeft", (playerId: string) => {
        setPlayers((prev) => prev.filter((player) => player.id !== playerId));
      });

      // Cell marked event
      socketInstance.on("cellMarked", (markEvent: MarkEvent) => {
        // Add to history
        setMarkHistory((prev) => [...prev, markEvent]);

        // Update player's marked cells
        setPlayers((prev) => {
          return prev.map((player) => {
            if (player.id === markEvent.playerId) {
              const updatedMarkedCells = [...player.markedCells];
              updatedMarkedCells[markEvent.row][markEvent.col] = true;

              return {
                ...player,
                markedCells: updatedMarkedCells,
              };
            }
            return player;
          });
        });

        // Update current player if it's us
        if (markEvent.playerId === socketInstance.id) {
          setCurrentPlayer((prev) => {
            if (!prev) return prev;
            const updatedMarkedCells = [...prev.markedCells];
            updatedMarkedCells[markEvent.row][markEvent.col] = true;

            return {
              ...prev,
              markedCells: updatedMarkedCells,
            };
          });
        }
      });

      // Cell unmarked event
      socketInstance.on("cellUnmarked", ({ playerId, row, col }) => {
        // Update player's marked cells
        setPlayers((prev) => {
          return prev.map((player) => {
            if (player.id === playerId) {
              const updatedMarkedCells = [...player.markedCells];
              updatedMarkedCells[row][col] = false;

              return {
                ...player,
                markedCells: updatedMarkedCells,
              };
            }
            return player;
          });
        });

        // Update current player if it's us
        if (playerId === socketInstance.id) {
          setCurrentPlayer((prev) => {
            if (!prev) return prev;
            const updatedMarkedCells = [...prev.markedCells];
            updatedMarkedCells[row][col] = false;

            return {
              ...prev,
              markedCells: updatedMarkedCells,
            };
          });
        }
      });

      // Player won event
      socketInstance.on("playerWon", ({ playerId, playerName }) => {
        setPlayers((prev) => {
          return prev.map((player) => {
            if (player.id === playerId) {
              return {
                ...player,
                hasWon: true,
              };
            }
            return player;
          });
        });

        // Update current player if it's us
        if (playerId === socketInstance.id) {
          setCurrentPlayer((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              hasWon: true,
            };
          });
        }
      });

      setSocket(socketInstance);
    };
    
    initSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join room function
  const joinRoom = (name: string, boardSize: number, boardData: string[][]) => {
    if (!socket || !isConnected) return;

    const initialMarkedCells = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(false));

    const playerData: Player = {
      id: socket.id || 'temp-id',
      name,
      boardSize,
      boardData,
      markedCells: initialMarkedCells,
      hasWon: false,
    };

    socket.emit("join", playerData);
    setCurrentPlayer(playerData);
  };

  // Mark cell function
  const markCell = (row: number, col: number, cellText: string) => {
    if (!socket || !isConnected || !currentPlayer) return;

    socket.emit("markCell", { row, col, cellText });
  };

  const value = {
    socket,
    isConnected,
    players,
    markHistory,
    currentPlayer,
    joinRoom,
    markCell,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
