import { useEffect, useState } from "react";
import "./App.css";
import Autocomplete from "./components/Autocomplete";
import useFetch from "./hooks/useFetch";
import { Country, CountryData } from "./types/Country";

function App() {
  const { data, isLoading, error } = useFetch<Country[]>(
    "https://restcountries.com/v3/all"
  );
  const [countries, setCountries] = useState<CountryData[]>([]);

  const handleItemClick = (item: CountryData) => {
    console.log(item);
  };

  useEffect(() => {
    const countries: CountryData[] = [];
    if (data && data.length) {
      data.map((d) =>
        countries.push({
          name: d.name.common,
          cca2: d.cca2,
          official: d.name.official,
          region: d.region
        })
      );
    }
    setCountries(countries);
  }, [data]);

  return (
    <div className="App">
      {error ? <div className="error">{JSON.stringify(error)}</div> : null}
      <h1 className="welcome-text">RESTCountriesAPI Search</h1>
      <div className="container">
        <Autocomplete<CountryData>
          data={countries}
          loading={isLoading}
          setSelectedItem={handleItemClick}
          filterField="name"
        />
      </div>
      <p className="info">
        Real data from <code>https://restcountries.com/v3/all</code>
      </p>
    </div>
  );
}

export default App;
