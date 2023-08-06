import { useEffect, useState } from "react";

type FetchData<T> = {
  data: T | null;
  isLoading: boolean;
  error: unknown;
};

const useFetch = <T>(url: string): FetchData<T> => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network error!");
        }
        const data: T = await response.json();
        setData(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, isLoading, error };
};

export default useFetch;
