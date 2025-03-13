import React from "react";
import "./styles.css";
const URL = "https://dummyjson.com/products/search?q=phone";

const getProducts = async (value: string) => {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/search?q=${value}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error("There is some error");
    }
    return data;
  } catch (err) {
    console.log(err);
  }
};

export default function App() {
  const [searchText, setSearchText] = React.useState<string>("");
  const [searchedData, setSearchedData] = React.useState<
    Array<Record<string, any>>
  >([]);
  const [openSuggestions, setOpenSuggestion] = React.useState<boolean>(false);
  const [higlightedSuggestion, setHiglightedSuggestion] =
    React.useState<number>(-1);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    if (!searchText.trim()) {
      setSearchedData([]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      getProducts(searchText).then((data) => {
        console.log("data", data);
        setSearchedData(data.products);
      });
    }, 300);
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };
  }, [searchText]);

  const onTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchText(value);
  };

  const onkeyBoardNavigation = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (searchedData.length === 0) return;

    if (event.key === "ArrowDown") {
      setHiglightedSuggestion((prev) =>
        prev === undefined || prev >= searchedData.length - 1 ? 0 : prev + 1
      );
    } else if (event.key === "ArrowUp") {
      setHiglightedSuggestion((prev) =>
        prev === undefined || prev <= 0 ? searchedData.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      if (higlightedSuggestion > -1) {
        setSearchText(searchedData[higlightedSuggestion].title);
      }
    }
  };

  return (
    <div className="App">
      <input
        type="text"
        value={searchText}
        onChange={onTextChange}
        onFocus={() => {
          setOpenSuggestion(true);
        }}
        onBlur={() => {
          setOpenSuggestion(false);
        }}
        onKeyDown={onkeyBoardNavigation}
      />
      {openSuggestions && (
        <div className="suggestion-container">
          {searchedData.length > 0 ? (
            searchedData.map((data, index) => {
              const classes = `suggestion-item ${
                higlightedSuggestion === index ? "active-suggestion" : ""
              }`;
              return (
                <div key={data.id} className={classes}>
                  {data.title}
                </div>
              );
            })
          ) : (
            <div>No results</div>
          )}
        </div>
      )}
    </div>
  );
}
