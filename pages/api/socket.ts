import type { NextApiRequest } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiResponse } from 'next';

interface Player {
  id: string;
  name: string;
  boardSize: number;
  boardData: string[][];
  markedCells: boolean[][];
  hasWon: boolean;
}

interface MarkEvent {
  playerId: string;
  playerName: string;
  row: number;
  col: number;
  cellText: string;
  timestamp: number;
}

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Global state
const players = new Map<string, Player>();
const markHistory: MarkEvent[] = [];

function areAllMarked(markedCells: boolean[][]): boolean {
  return markedCells.every(row => row.every(cell => cell === true));
}

function checkWinner(playerId: string): boolean {
  const player = players.get(playerId);
  if (!player) return false;
  
  const { markedCells, boardSize } = player;
  
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    if (markedCells[row].every(cell => cell === true)) {
      return true;
    }
  }
  
  // Check columns
  for (let col = 0; col < boardSize; col++) {
    const columnMarked = markedCells.every(row => row[col] === true);
    if (columnMarked) {
      return true;
    }
  }
  
  // Check diagonal (top-left to bottom-right)
  const diag1Marked = Array.from({ length: boardSize }).every(
    (_, i) => markedCells[i][i] === true
  );
  if (diag1Marked) {
    return true;
  }
  
  // Check diagonal (top-right to bottom-left)
  const diag2Marked = Array.from({ length: boardSize }).every(
    (_, i) => markedCells[i][boardSize - 1 - i] === true
  );
  if (diag2Marked) {
    return true;
  }

  // Check if all cells are marked (Full House)
  if (areAllMarked(markedCells)) {
    return true;
  }
  
  return false;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get a reference to the socket.io server or create a new one
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Send current players and history to the new player
      socket.emit('initialState', {
        players: Array.from(players.values()),
        markHistory: markHistory,
      });

      // User joined with their bingo board
      socket.on('join', (playerData: Player) => {
        const player = {
          ...playerData,
          id: socket.id,
          hasWon: false,
        };
        
        players.set(socket.id, player);
        io.emit('playerJoined', player);
        console.log(`Player joined: ${player.name}`);
      });

      // Handle player marking a cell
      socket.on('markCell', ({ row, col, cellText }) => {
        const player = players.get(socket.id);
        if (!player) return;

        // Update the player's marked cells
        const updatedMarkedCells = [...player.markedCells];
        updatedMarkedCells[row][col] = !updatedMarkedCells[row][col];
        
        players.set(socket.id, {
          ...player,
          markedCells: updatedMarkedCells,
        });

        // Add to history if cell is marked (not unmarked)
        if (updatedMarkedCells[row][col]) {
          const markEvent: MarkEvent = {
            playerId: socket.id,
            playerName: player.name,
            row,
            col,
            cellText,
            timestamp: Date.now(),
          };
          
          markHistory.push(markEvent);
          io.emit('cellMarked', markEvent);

          // Check if player won
          const hasWon = checkWinner(socket.id);
          if (hasWon && !player.hasWon) {
            players.set(socket.id, {
              ...player,
              hasWon: true,
              markedCells: updatedMarkedCells,
            });
            io.emit('playerWon', {
              playerId: socket.id,
              playerName: player.name,
            });
          }
        } else {
          // Cell was unmarked
          io.emit('cellUnmarked', {
            playerId: socket.id,
            row,
            col,
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
      });
    });
  }

  res.status(200).json({ message: 'Socket.IO server is running' });
}