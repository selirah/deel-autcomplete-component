import {
  ChangeEvent,
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  FormEvent
} from "react";
import { useOnClickOutside } from "../hooks/useOnclickOutside";
import ReactDOM from "react-dom";
import "./Autocomplete.css";

type Props<T> = {
  data: T[];
  loading: boolean;
  setSelectedItem?: (item: T) => void;
  filterKey: keyof T;
};

type HighlightSearchValueProps = {
  value: string;
  searchValue: string;
};

const HighlightSearchValue = ({
  searchValue,
  value
}: HighlightSearchValueProps) => {
  const regex = new RegExp(searchValue, "gi");
  const isSearchValueFound = regex.test(value);
  if (isSearchValueFound) {
    const highlightedCountry = value.replace(
      regex,
      `<span style="background-color: yellow">${searchValue}</span>`
    );

    return <div dangerouslySetInnerHTML={{ __html: highlightedCountry }} />;
  }
  return <div>{value}</div>;
};

const Autocomplete = <T extends object>({
  data,
  loading,
  setSelectedItem,
  filterKey
}: Props<T>) => {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  /**
   * Asynchronous function to filter data
   * simulate an asynchronous opearation
   * just like performing the filtering on a server
   * set the debounce time to 1 second
   * to allow user type in more characters
   * useful when performing server filtering
   * to prevent multiple needless server requests.
   */
  const filterDataAsync = (filterValue: string): Promise<T[]> => {
    return new Promise<T[]>((resolve, reject) => {
      setTimeout(() => {
        try {
          const filteredData = data.filter((item: T) => {
            const fieldValue = item[filterKey] as string;
            return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
          });
          resolve(filteredData);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // On change event to handle data filtering
  // using the input from the user.
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue(input);
    setActiveSuggestion(0);
    if (!input) {
      setShowSuggestions(false);
      return;
    }
    filterDataAsync(input)
      .then((data) => {
        setShowSuggestions(true);
        setSuggestions(data);
      })
      .catch((error) => {
        throw Error(error);
      });
  };

  // Input keydown event
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const suggestionsList = ReactDOM.findDOMNode(
      suggestionsRef.current
    ) as HTMLUListElement;

    if (e.key === "ArrowUp" && activeSuggestion !== 0) {
      // User pressed the Arrow Up key
      setActiveSuggestion((prev) => prev - 1);
      if (
        (e.target as HTMLInputElement).value.length > -1 &&
        suggestionsList !== null &&
        activeSuggestion <= suggestions.length / 2
      ) {
        suggestionsList.scrollTop = 0;
      }
    } else if (
      e.key === "ArrowDown" &&
      activeSuggestion < suggestions.length - 1
    ) {
      // User pressed the Arrow Down key
      setActiveSuggestion((prev) => prev + 1);
      if (
        (e.target as HTMLInputElement).value.length > -1 &&
        suggestionsList !== null &&
        activeSuggestion >= suggestions.length / 2
      ) {
        suggestionsList.scrollTop = suggestionsList.scrollHeight;
      }
    } else if (e.key === "Escape") {
      // User pressed the Escape key
      setShowSuggestions(false);
      setValue("");
    } else if (e.key === "Enter" && value !== "" && suggestions.length > 0) {
      // User pressed the Enter key
      setShowSuggestions(false);
      setValue(suggestions[activeSuggestion][filterKey]);
      setSelectedItem && setSelectedItem(suggestions[activeSuggestion]);
    } else {
      return;
    }
  };

  // When a user selects a country,
  // set the value to the selected country
  // and close the suggestion container
  const onSetSuggestion = (item: T) => {
    setShowSuggestions(false);
    setValue(item[filterKey]);
    setSelectedItem && setSelectedItem(item);
  };

  const onInputClick = (e: FormEvent<EventTarget>) => {
    e.stopPropagation();
  };

  const onSuggestionItemHover = (index: number) => {
    setActiveSuggestion(index);
  };

  // auto focus on the input box
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Custom hook to listen to outside click event
  // When user clicks outside the search box,
  // the suggestions div should disappear
  useOnClickOutside(containerRef, () => {
    setShowSuggestions(false);
  });

  return (
    <div className="autocomplete-wrapper" ref={containerRef}>
      <input
        ref={inputRef}
        placeholder="Type to filter . . ."
        value={value}
        onChange={handleOnChange}
        className="filter-wrapper"
        onKeyDown={onKeyDown}
        onClick={onInputClick}
      />
      {loading && <div>Loading...</div>}
      {showSuggestions && (
        <ul ref={suggestionsRef} className="list-wrapper">
          {suggestions && suggestions.length ? (
            suggestions.map((suggestion) => (
              <li
                key={suggestion[filterKey]}
                className={`filter-item ${
                  suggestions.indexOf(suggestion) === activeSuggestion
                    ? "active"
                    : ""
                }`}
                onMouseEnter={() =>
                  onSuggestionItemHover(suggestions.indexOf(suggestion))
                }
                onClick={() => onSetSuggestion(suggestion)}
              >
                <HighlightSearchValue
                  value={suggestion[filterKey]}
                  searchValue={value}
                />
              </li>
            ))
          ) : (
            <li className="filter-item">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
