// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import RandomPokemon from './pages/RandomPokemon';
// import FavoritesPage from './pages/Favorites';
// import Pokemon from './pages/Pokemon';
// import Home from './pages/Home'; // Import this new file
// import PokemonCardGame from './pages/PokemonCardGame';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/PokemonCardGame" element={<PokemonCardGame />} />
//         <Route path="/RandomPokemon" element={<RandomPokemon />} />
//         <Route path="/pokemon" element={<Pokemon />} />
//         <Route path="/pokemon/:id" element={<Pokemon />} />
//         <Route path="/favorites" element={<FavoritesPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RandomPokemon from './pages/RandomPokemon';
import FavoritesPage from './pages/Favorites';
import Pokemon from './pages/Pokemon';
import Home from './pages/Home';
import PokemonCardGame from './pages/PokemonCardGame';
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="custom-scrollbar overflow-y-auto max-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/PokemonCardGame" element={<PokemonCardGame />} />
          <Route path="/RandomPokemon" element={<RandomPokemon />} />
          <Route path="/pokemon" element={<Pokemon />} />
          <Route path="/pokemon/:id" element={<Pokemon />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* 🔁 Fallback route for 404 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
