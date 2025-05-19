'use client';

import { useState, useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";
import PlayerNameInput from "./components/PlayerNameInput";
import PlayersList from "./components/PlayersList";
import MarkHistory from "./components/MarkHistory";

// Tamanhos de cartela disponíveis
const BOARD_SIZES = [3, 4, 5];

export default function Home() {
  const { isConnected, joinRoom, markCell, currentPlayer } = useSocket();
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [boardSize, setBoardSize] = useState<number>(4);
  const [isCreating, setIsCreating] = useState<boolean>(true);
  const [boardData, setBoardData] = useState<string[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(""))
  );
  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);
  const [cellText, setCellText] = useState<string>("");

  // Reset board state when size changes
  useEffect(() => {
    setBoardData(Array(boardSize).fill(null).map(() => Array(boardSize).fill("")));
  }, [boardSize]);

  // Atualiza estruturas de dados quando o tamanho da cartela muda
  const handleSizeChange = (newSize: number) => {
    setBoardSize(newSize);
    setEditingCell(null);
  };

  // Alterna entre o modo de edição e o modo de jogo
  const toggleMode = () => {
    setIsCreating(!isCreating);
    setEditingCell(null);
  };

  // Inicia a edição de uma célula
  const startEdit = (row: number, col: number) => {
    if (!isCreating) return;
    
    setEditingCell([row, col]);
    setCellText(boardData[row][col]);
  };

  // Salva o texto editado na célula
  const saveEdit = () => {
    if (editingCell) {
      const [row, col] = editingCell;
      const newBoardData = [...boardData];
      newBoardData[row][col] = cellText;
      setBoardData(newBoardData);
      setEditingCell(null);
    }
  };

  // Marca/desmarca uma célula durante o jogo
  const handleCellClick = (row: number, col: number) => {
    if (isCreating) {
      startEdit(row, col);
      return;
    }
    
    // Emitir evento de marcação para o socket
    markCell(row, col, boardData[row][col]);
  };

  // Preenche todas as células com texto aleatório (para demonstração)
  const fillRandomText = () => {
    const sampleTexts = [
      "Falou 'na verdade'", 
      "Alguém se desculpou", 
      "Falou do trânsito", 
      "Alguém chegou atrasado", 
      "Problema técnico", 
      "Caiu o Wi-Fi",
      "Cachorro latindo",
      "Alguém no mudo",
      "Criança apareceu",
      "Aquele silêncio",
      "Nova pendência",
      "Reunião que poderia ser email",
      "Sem pauta definida",
      "Tela compartilhada errada",
      "Áudio ruim",
      "Alguém saiu mais cedo",
      "Falou 'voltando um pouco'",
      "Interrupção",
      "'Estão me ouvindo?'",
      "Alguém esqueceu a câmera ligada",
      "Passou do horário",
      "Pergunta no final",
      "Alguém comendo",
      "Microfonia",
      "Café na reunião"
    ];

    const newBoardData = Array(boardSize).fill(null).map(() => 
      Array(boardSize).fill(null).map(() => 
        sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
      )
    );
    
    setBoardData(newBoardData);
  };

  // Manipular nome do jogador enviado
  const handleNameSubmit = (name: string) => {
    // Entrar na sala
    joinRoom(name, boardSize, boardData);
    setHasJoined(true);
    // Alterar para modo de jogo
    setIsCreating(false);
  };

  // Renderizar tela de entrada se o jogador ainda não entrou
  if (!hasJoined) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-center">Bingo Dinâmico</h1>
        
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Crie sua cartela de Bingo primeiro</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tamanho da cartela:</label>
                <div className="flex gap-2">
                  {BOARD_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-1 rounded ${
                        boardSize === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={fillRandomText}
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Preencher Aleatório
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Ou clique em cada célula para editar manualmente
                </p>
              </div>
              
              <div 
                className="grid gap-2 mb-6 mx-auto" 
                style={{ 
                  gridTemplateColumns: `repeat(${boardSize}, minmax(80px, 1fr))`,
                }}
              >
                {boardData.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => startEdit(rowIndex, colIndex)}
                      className={`
                        border-2 p-2 rounded-lg min-h-[80px] flex items-center justify-center text-center cursor-pointer
                        ${editingCell && editingCell[0] === rowIndex && editingCell[1] === colIndex ? "border-blue-500" : "border-gray-300 dark:border-gray-600"}
                        transition-colors hover:border-blue-400 dark:hover:border-blue-500
                      `}
                    >
                      {editingCell && editingCell[0] === rowIndex && editingCell[1] === colIndex ? (
                        <textarea
                          value={cellText}
                          onChange={(e) => setCellText(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              saveEdit();
                            }
                          }}
                          className="w-full h-full min-h-[70px] p-1 bg-transparent resize-none focus:outline-none text-center"
                          autoFocus
                        />
                      ) : (
                        <span>{cell}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <PlayerNameInput 
            onSubmit={handleNameSubmit} 
            isConnected={isConnected} 
          />
        </div>
      </div>
    );
  }

  // Interface principal após o jogador entrar
  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Bingo Dinâmico</h1>
        
        {currentPlayer?.hasWon && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center animate-pulse">
            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              🎉 Você Venceu! 🎉
            </h2>
            <p>Parabéns! Você completou seu bingo!</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Sua Cartela de Bingo</h2>
                <div>
                  <span className="text-sm text-gray-500 mr-2">
                    Jogando como: <strong>{currentPlayer?.name}</strong>
                  </span>
                </div>
              </div>
            
              <div 
                className="grid gap-2 mx-auto" 
                style={{ 
                  gridTemplateColumns: `repeat(${boardSize}, minmax(60px, 1fr))`,
                }}
              >
                {boardData.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        border-2 p-2 rounded-lg min-h-[70px] sm:min-h-[80px] flex items-center justify-center text-center cursor-pointer
                        ${currentPlayer?.markedCells[rowIndex][colIndex] ? "bg-green-200 dark:bg-green-800 border-green-400" : "border-gray-300 dark:border-gray-600"}
                        transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                      `}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{cell}</span>
                        {currentPlayer?.markedCells[rowIndex][colIndex] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 text-green-600 dark:text-green-400 checkmark-animation">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <MarkHistory />
          </div>
          
          <div>
            <PlayersList />
          </div>
        </div>
      </div>
    </div>
  );
}