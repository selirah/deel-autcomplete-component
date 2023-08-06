export interface Country {
  name: {
    common: string;
    official: string;
  };
  flag: string;
  population: number;
  region: string;
  cca2: string;
}

export interface CountryData {
  name: string;
  official: string;
  cca2: string;
  region: string;
}
