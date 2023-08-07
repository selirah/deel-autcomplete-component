import { useEffect, useState } from "react";
import "./App.css";
import Autocomplete from "./components/Autocomplete";
import useFetch from "./hooks/useFetch";
import { Pokemon, PokemonCharacter } from "./types/Pokemon";

function App() {
  const { data, isLoading, error } = useFetch<Pokemon>(
    "https://pokeapi.co/api/v2/pokemon?limit=100"
  );
  const [characters, setCharacters] = useState<PokemonCharacter[]>([]);

  const handleItemClick = (item: PokemonCharacter) => {
    console.log(item);
  };

  useEffect(() => {
    if (data) {
      setCharacters(data.results);
    }
  }, [data]);

  return (
    <div className="App">
      {error ? <div className="error">{JSON.stringify(error)}</div> : null}
      <h1 className="welcome-text">Pokemon API Filter</h1>
      <div className="container">
        <Autocomplete<PokemonCharacter>
          data={characters}
          loading={isLoading}
          setSelectedItem={handleItemClick}
          filterKey="name"
        />
      </div>
      <p className="info">
        Real data from{" "}
        <a href="https://pokeapi.co/api/v2/pokemon?limit=100" target="_blank">
          <code>https://pokeapi.co/api/v2/pokemon</code>
        </a>
      </p>
    </div>
  );
}

export default App;
