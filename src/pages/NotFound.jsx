import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import notFoundImg from "../assets/notFound/error.gif";

const pokemonQuotes = [
  "Pikachu! I choose you... to find your way home!",
  "Looks like Team Rocket's broken the link again!",
  "Even Ash gets lost sometimes. You'll find your way!",
  "A wild 404 error appeared!",
  "Trainer, this path leads nowhere. Let's head back!",
  "Professor Oak says: You shouldn’t be here!",
  "Charmander burned this page down 🔥",
  "Misty says: This isn’t the Gym you’re looking for.",
  "Error used Confusion! It was super effective!",
  "Snorlax is blocking this page. Try another route!",
];

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [cancelRedirect, setCancelRedirect] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(true);

  const [randomQuote, setRandomQuote] = useState("");
 
  // Pick a quote
  useEffect(() => {
    const index = Math.floor(Math.random() * pokemonQuotes.length);
    const quote = pokemonQuotes[index];
    setRandomQuote(quote);

    // Try to extract a Pokémon name from the quote
    const pokeMatch = quote.match(/\b(Pikachu|Charmander|Ash|Snorlax|Misty)\b/i);
  }, []);

  // Handle redirect countdown
  useEffect(() => {
    if (cancelRedirect) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
      setProgress((prev) => prev + 10);
    }, 1000);

    const timeout = setTimeout(() => {
      if (!cancelRedirect) navigate("/");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, cancelRedirect]);

  // Auto-hide toast
  useEffect(() => {
    const toastTimeout = setTimeout(() => {
      setShowToast(false);
    }, 5000);

    return () => clearTimeout(toastTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-6 text-center relative">

      {/* Progress Bar */}
      {!cancelRedirect && (
        <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 404 Animation */}
      <img
        src={notFoundImg}
        alt="404 Illustration"
        className="max-w-md w-full mb-6 animate-bounce"
      />

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        Looks like you're lost
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        The page you are looking for is not available!
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <Link
          to="/"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold transition duration-300"
        >
          Go to Home
        </Link>
        {!cancelRedirect && (
          <button
            onClick={() => setCancelRedirect(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition duration-300"
          >
            Cancel Redirect
          </button>
        )}
      </div>

      {/* Countdown */}
      {!cancelRedirect && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ⏳ Redirecting in <strong>{countdown}</strong> second{countdown !== 1 && "s"}...
        </p>
      )}

      {/* Toast message */}
      {showToast && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-5 py-3 rounded-md shadow-md text-sm animate-fadeInUp">
          🚧 {randomQuote}
        </div>
      )}
    </div>
  );
}
