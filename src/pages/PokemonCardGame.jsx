import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import Sidebar from "../components/Sidebar";
import { FaShareAlt, FaWhatsapp } from "react-icons/fa";

const getRandomId = () => Math.floor(Math.random() * 150) + 1;

const fetchPokemon = async (id) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    attack: data.stats[1].base_stat,
    image: data.sprites.other.dream_world.front_default,
  };
};

const getStoredMatchHistory = () => {
  const data = localStorage.getItem("matchHistory");
  return data ? JSON.parse(data) : [];
};

const storeMatchResult = (result) => {
  const history = getStoredMatchHistory();
  const updated = [...history, result];
  localStorage.setItem("matchHistory", JSON.stringify(updated));
};

const PokemonCardGame = () => {
  const [round, setRound] = useState(1);
  const [userOptions, setUserOptions] = useState([]);
  const [computerPokemon, setComputerPokemon] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [history, setHistory] = useState([]);
  const [finalResult, setFinalResult] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [matchHistory, setMatchHistory] = useState(getStoredMatchHistory());
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!localStorage.getItem("username"));

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedProfile, setSelectedProfile] = useState(null);

  const winAudio = new Audio("/win.wav");
  const loseAudio = new Audio("/lose.wav");

winAudio.volume = 1;
loseAudio.volume = 1;


  const postMatchResult = async (username, result) => {
    try {
      // await fetch("http://localhost:5000/api/match", {
      await fetch("https://poke-dex-pro-backend-1.onrender.com/api/match",{
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, result }),
      });
    } catch (error) {
      console.error("Failed to post match result:", error);
    }
  };


const computeLeaderboard = async () => {
  try {
    const BASE_URL = "https://poke-dex-pro-backend-1.onrender.com";

    const res = await fetch(`${BASE_URL}/api/leaderboard`);
   

    const data = await res.json();

    const formatted = data.map(user => ({
      ...user,
      image: user.image ? `${BASE_URL}${user.image}` : null
    }));

    setLeaderboard(formatted); // ✅ Make sure leaderboard is an array with at least 1 object
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err.message);
  }
};

  useEffect(() => {
    computeLeaderboard();
  }, [matchHistory]);

  useEffect(() => {
  if (username) {
    loadNewRound();
  }
}, [username]);

  const loadNewRound = async () => {
    const ids = [getRandomId(), getRandomId(), getRandomId()];
    const pokemons = await Promise.all(ids.map(fetchPokemon));
    setUserOptions(pokemons);
    setSelectedPokemon(null);
    setComputerPokemon(null);
  };

  const handleSelect = async (poke) => {
    const computer = await fetchPokemon(getRandomId());
    setComputerPokemon(computer);
    setSelectedPokemon(poke);

    let result = "";
    if (poke.attack > computer.attack) {
      result = "User Wins";
    } else if (poke.attack < computer.attack) {
      result = "Computer Wins";
    } else {
      result = "Draw";
    }

    const roundResult = {
      round,
      user: poke,
      computer,
      result,
    };

    const updatedHistory = [...history, roundResult];
    setHistory(updatedHistory);

    if (round === 3) {
      setGameOver(true);
      const userWins = updatedHistory.filter((h) => h.result === "User Wins").length;
      const computerWins = updatedHistory.filter((h) => h.result === "Computer Wins").length;

      let matchResult = "";
      if (userWins > computerWins) {
        matchResult = "🎉 You won the match!";
        winAudio.play();
        confetti();
        postMatchResult(username, "win");
      } else if (computerWins > userWins) {
        matchResult = "💻 Computer won the match!";
        
      loseAudio.play();
        postMatchResult(username, "lose");
      } else {
        matchResult = "🤝 Match Draw!";
        postMatchResult(username, "draw");
      }

      setFinalResult(matchResult);

      const gameData = {
        timestamp: new Date().toLocaleString(),
        result: matchResult,
        rounds: updatedHistory,
      };

      storeMatchResult(gameData);
      setMatchHistory((prev) => [...prev, gameData]);
    } else {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        loadNewRound();
      }, 1500);
    }
  };

  const restartGame = () => {
    setRound(1);
    setHistory([]);
    setFinalResult("");
    setGameOver(false);
    loadNewRound();
    stopAllAudio();
  };

  const stopAllAudio = () => {
  winAudio.pause();
  winAudio.currentTime = 0;
  loseAudio.pause();
  loseAudio.currentTime = 0;
};

const handleUsernameSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("username", username);
  formData.append("result", "start"); // Set initial result to 'start'

  if (selectedImage) {
    formData.append("image", selectedImage);
  }

  try {
    // const BASE_URL =
    //   window.location.hostname === "localhost"
    //     ? "http://localhost:5000"
    //     : "https://poke-dex-pro-backend-1.onrender.com";

    const BASE_URL = "https://poke-dex-pro-backend-1.onrender.com";

    const res = await fetch(`${BASE_URL}/api/match`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("User submitted successfully:", data);

    // ✅ Store username locally to prevent repeat prompts
    localStorage.setItem("username", username);
    if (selectedImage) {
      localStorage.setItem("userImage", URL.createObjectURL(selectedImage)); // Temporary preview
    }

    setShowUsernamePrompt(false);
  } catch (err) {
    console.error("Error submitting username and image:", err.message);
  }
};



  return (
    
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-rose-100 dark:from-gray-800 dark:to-gray-900">
      <Sidebar />
       
   

      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <form
      onSubmit={handleUsernameSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-[90%] shadow-lg text-center"
      encType="multipart/form-data"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Welcome Trainer!</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter your name to start the battle:</p>

      {/* Username Input */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white mb-4"
        placeholder="Enter your name"
        required
      />

      {/* Image Upload Input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
        className="w-full text-sm text-gray-600 dark:text-gray-300 mb-4"
      />

      {/* Image Preview */}
      {selectedImage ? (
        <img
          src={URL.createObjectURL(selectedImage)}
          alt="Preview"
          className="mx-auto mb-4 w-16 h-16 rounded-full object-cover border-2 border-blue-500"
        />
      ) : (
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getRandomId()}.png`}
          alt="Default"
          className="mx-auto mb-4 w-16 h-16"
        />
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold"
      >
        Start Game
      </button>
    </form>
  </div>
)}



      {!showUsernamePrompt && (
        <div className="p-6 text-center max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">⚔️ Pokémon Card Battle</h1>
          <h2 className="text-lg text-gray-600 dark:text-gray-300 mb-6">Welcome, {username}! Round {round} / 3</h2>

          {/* Include rest of game UI here */}
          {/* Keep your existing JSX for history, leaderboard, help modal, gameOver results, selection, etc. */} <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-rose-100 dark:from-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="p-6 text-center max-w-6xl mx-auto">

        {/* 🏆 Leaderboard Button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="fixed bottom-20 right-6 z-50 bg-yellow-500 text-white w-12 h-12 text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transition"
          title="Leaderboard"
        >
          🏆
        </button>

        {/* 🏆 Leaderboard Modal */}
       {showLeaderboard && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-[95%] text-center relative shadow-xl transition-transform duration-300 scale-100">
      <button
        onClick={() => setShowLeaderboard(false)}
        className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-red-500"
      >
        ×
      </button>

      <h2 className="text-2xl font-extrabold mb-5 text-gray-800 dark:text-white">
        🏆 Global Top 100 Winners
      </h2>

      {/* <ul className="max-h-80 overflow-y-auto text-left space-y-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-gray-800 px-2"> */}
      <ul className="custom-scrollbar overflow-y-auto max-h-80 space-y-3 px-2">
        {leaderboard.slice(0, 100).map((u, i) => {
          const isCurrentUser = u.username === username;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";

          return (
            <li
              key={i}
              onClick={() => setSelectedProfile({ ...u, rank: i + 1, history: u.history || [] })}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                isCurrentUser
                  ? "bg-yellow-100 dark:bg-yellow-700 font-bold hover:bg-yellow-200 dark:hover:bg-yellow-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {u.image ? (
                <img
                  src={u.image}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-white">
                  {u.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  <b>#{i + 1}</b> {medal} - {u.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Wins: {u.wins}, Losses: {u.losses}, Draws: {u.draws}, Games: {u.games}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {!leaderboard.slice(0, 100).some((u) => u.username === username) && (
        <div className="mt-5 border-t pt-4 text-sm text-gray-800 dark:text-gray-200 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">
            📌 Your Stats
          </h3>
          {(() => {
            const userEntry = leaderboard.find((u) => u.username === username);
            const rank = leaderboard.findIndex((u) => u.username === username) + 1;

            if (userEntry) {
              return (
                <div className="flex items-center gap-3">
                  {userEntry.image ? (
                    <img
                      src={userEntry.image}
                      alt={userEntry.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                      {userEntry.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p>
                      <b>#{rank}</b> - {userEntry.username}
                    </p>
                    <p className="text-xs">
                      Wins: {userEntry.wins}, Losses: {userEntry.losses}, Draws: {userEntry.draws}, Games: {userEntry.games}
                    </p>
                  </div>
                </div>
              );
            } else {
              return <p className="italic text-gray-500">You're not ranked yet. Start playing to enter the board!</p>;
            }
          })()}
        </div>
      )}

      {selectedProfile && (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-md text-center shadow-2xl relative animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={() => setSelectedProfile(null)}
        className="absolute top-3 right-4 text-gray-600 dark:text-gray-300 text-xl hover:text-red-500"
      >
        ×
      </button>

      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        {selectedProfile.image ? (
          <img
            src={selectedProfile.image}
            alt={selectedProfile.username}
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold">
            {selectedProfile.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name and Flag */}
      <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-white flex items-center justify-center gap-2">
        {selectedProfile.username}
        <img
          src="https://flagcdn.com/w40/in.png"
          alt="India"
          className="w-5 h-5 rounded"
        />
      </h3>

      {/* Rank */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        🏅 Rank #{selectedProfile.rank}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="bg-green-100 dark:bg-green-800 px-3 py-1 rounded">✅ Wins: {selectedProfile.wins}</p>
        <p className="bg-red-100 dark:bg-red-800 px-3 py-1 rounded">❌ Losses: {selectedProfile.losses}</p>
        <p className="bg-yellow-100 dark:bg-yellow-700 px-3 py-1 rounded col-span-2">
          🤝 Draws: {selectedProfile.draws} | 🎮 Games: {selectedProfile.games}
        </p>
      </div>

      {/* Share Buttons */}
      <div className="flex justify-center gap-3 mt-4">
 <a
  href={`https://wa.me/?text=${encodeURIComponent(
    `🔥 ${selectedProfile.username}'s Rank: #${selectedProfile.rank}\n✅ Wins: ${selectedProfile.wins} | ❌ Losses: ${selectedProfile.losses} | 🤝 Draws: ${selectedProfile.draws}\n🎮 Games: ${selectedProfile.games}\nPlay now: ${window.location.href}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
>
  <FaWhatsapp />
</a>

  <button
    onClick={() => navigator.share?.({
      title: `${selectedProfile.username}'s Profile`,
      text: `🔥 Rank #${selectedProfile.rank} | Games: ${selectedProfile.games}`,
      url: window.location.href,
    })}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded flex items-center gap-1"
  >
    <FaShareAlt />
  </button>
</div>

    </div>
  </div>
)}


    </div>
  </div>
)}

        {/* ... rest of your component (history, help modal, cards, results, etc.) */}
        <div className="p-6  text-center max-w-6xl mx-auto">
        {!gameOver && (
          <>
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Choose your Pokémon:</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {userOptions.map((poke) => (
                <div
                  key={poke.id}
                  onClick={() => handleSelect(poke)}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg w-40 shadow hover:scale-105 transition-transform cursor-pointer"
                >
                  <img src={poke.image} alt={poke.name} className="w-24 mx-auto" />
                  <p className="capitalize mt-2 font-semibold text-gray-800 dark:text-white">{poke.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">⚔️ {poke.attack}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedPokemon && computerPokemon && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Result:</h3>
            <div className="flex justify-center gap-8 flex-wrap">
              {[{ ...selectedPokemon, label: "You" }, { ...computerPokemon, label: "Computer" }].map((poke, i) => (
                <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow w-40">
                  <h4 className="font-bold text-gray-700 dark:text-white">{poke.label}</h4>
                  <img src={poke.image} className="w-24 mx-auto" alt={poke.name} />
                  <p className="capitalize font-semibold mt-2 text-gray-800 dark:text-white">{poke.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">⚔️ {poke.attack}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{finalResult}</h2>
            <h3 className="text-lg font-semibold mt-4 text-gray-800 dark:text-white">🕹️ Match History (This Game)</h3>
            <ul className="text-left mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {history.map((h) => (
                <li key={h.round}>
                  <strong>Round {h.round}:</strong> {h.user.name} (⚔️ {h.user.attack}) vs {h.computer.name} (⚔️ {h.computer.attack}) →{" "}
                  <b>{h.result}</b>
                </li>
              ))}
            </ul>
            <button
              onClick={restartGame}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
            >
              🔄 Restart Game
            </button>
          </div>
        )}

        {/* Floating Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-12 h-12 text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 transition"
          title="Help"
        >
          ?
        </button>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white max-w-xl w-[90%] p-6 rounded-lg shadow-lg relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-3 text-2xl text-gray-600 dark:text-white hover:text-red-500"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">🆘 Help - Pokémon Card Battle</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
  <li>Each match has <strong>3 rounds</strong>.</li>
  <li>Choose 1 of 3 Pokémon cards each round.</li>
  <li>Their attack is compared to the computer’s Pokémon.</li>
  <li>Win the round if your attack is higher.</li>
  <li>After 3 rounds, overall winner is declared.</li>
  <li>🏆 <strong>Leaderboard</strong> displays top 100 global players. If you're not in top 100, your rank still shows at the bottom!</li>
  <li>You can restart the game anytime after a match ends.</li>
</ol>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Enjoy your battle and good luck!
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
        </div>
      )}
    </div>
  );
};

export default PokemonCardGame;