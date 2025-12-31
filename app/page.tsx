'use client';
import { useState, useEffect } from 'react';

type Item = {
  word: string;
  clues: string[];
  imagen: string;
};

type Player = {
  id: number;
  role: 'normal' | 'impostor';
};

const JuegoDelImpostor = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [impostorClue, setImpostorClue] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [showCard, setShowCard] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  /* =============================
     CARGA DE ITEMS
  ============================== */
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/items.json');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error al cargar los items:', error);
      }
    };

    loadItems();
  }, []);

  const randomFrom = (array: any[]) =>
    array[Math.floor(Math.random() * array.length)];

  /* =============================
     LÓGICA DEL JUEGO
  ============================== */
  const startGame = () => {
    if (items.length === 0) return;

    const selected = randomFrom(items);
    setSelectedItem(selected);
    setImpostorClue(randomFrom(selected.clues));

    const initialPlayers: Player[] = Array.from(
      { length: numPlayers },
      (_, i) => ({ id: i, role: 'normal' })
    );

    const impostorIndex = crypto.getRandomValues(new Uint32Array(1))[0] % numPlayers;
    initialPlayers[impostorIndex].role = 'impostor';

    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setShowCard(false);
    setGameEnded(false);
  };

  const revealCard = () => setShowCard(true);

  const nextPlayer = () => {
    setShowCard(false);
    if (currentPlayer + 1 >= players.length) {
      setGameEnded(true);
    } else {
      setCurrentPlayer((p) => p + 1);
    }
  };

  const resetGame = () => {
    setPlayers([]);
    setCurrentPlayer(0);
    setSelectedItem(null);
    setImpostorClue('');
    setGameEnded(false);
  };

  /* =============================
     CONTROL CON TECLA ESPACIO
  ============================== */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      e.preventDefault();

      // Juego no iniciado
      if (players.length === 0) {
        startGame();
        return;
      }

      // Juego terminado
      if (gameEnded) {
        resetGame();
        return;
      }

      // Durante el juego
      if (!showCard) {
        revealCard();
      } else {
        nextPlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players, showCard, gameEnded]);

  /* =============================
     RENDER DE CARTA
  ============================== */
  const renderCard = () => {
    if (!selectedItem) return null;
    const player = players[currentPlayer];

    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md mt-4">
        <p className="text-xl font-bold mb-2">
          Jugador {currentPlayer + 1}
        </p>

        {player.role === 'impostor' ? (
          <>
            <p className="text-lg mb-1">😈 Eres el IMPOSTOR</p>
            <p className="text-sm">Pista: {impostorClue}</p>
          </>
        ) : (
          <>
            <p className="text-lg mb-1">🙂 Jugador normal</p>
            <p className="text-sm">
              La palabra es: <strong>{selectedItem.word}</strong>
            </p>
            <img
              className="mt-4 max-w-xs mx-auto rounded-md"
              src={selectedItem.imagen}
              alt={selectedItem.word}
            />
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Presiona ␣ (espacio) para continuar
        </p>
      </div>
    );
  };

  /* =============================
     UI
  ============================== */
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl mb-6">🕵️ Juego del Impostor</h1>

      {gameEnded ? (
        <div className="text-center">
          <p className="text-lg mb-4">
            🎯 Fin de la ronda. ¡El juego ha terminado!
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Presiona ␣ para volver a empezar
          </p>
          <button
            onClick={resetGame}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Volver a empezar
          </button>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center">
          <input
            type="number"
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number(e.target.value))}
            className="p-2 bg-gray-800 text-white rounded-md"
            min={3}
            max={12}
          />
          <p className="text-xs text-gray-400 mt-2">
            Presiona ␣ para iniciar
          </p>
          <button
            onClick={startGame}
            className="mt-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Iniciar Juego
          </button>
        </div>
      ) : (
        <div className="text-center">
          {!showCard ? (
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <p className="text-lg mb-4">
                Jugador {currentPlayer + 1}, prepárate a ver tu carta
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Presiona ␣ para ver tu carta
              </p>
              <button
                onClick={revealCard}
                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
              >
                Ver mi carta
              </button>
            </div>
          ) : (
            <>
              {renderCard()}
              <button
                onClick={nextPlayer}
                className="mt-4 p-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
              >
                Siguiente jugador
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JuegoDelImpostor;
