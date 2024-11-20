import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useLoacalStorage } from "./useLocalStorage";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const apiKey = process.env.REACT_APP_API_KEY;
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  //const tempQuery = "interstellar";
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useLoacalStorage([], "watched");
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   return storedValue ? JSON.parse(storedValue) : [];
  // });

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleWatchedMovies(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
  }

  // useEffect(
  //   function () {
  //     localStorage.setItem("watched", JSON.stringify(watched));
  //   },
  //   [watched]
  // );

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          if (!res.ok) {
            throw new Error("Somthing went wrong!!");
          }
          if (data.Response === "False") {
            throw new Error("Movie not found");
          }
          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <LogoText />
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </NavBar>
      <Main>
        {/* //////////////////////////////// Implicitly Pass a child///////////////// */}
        {/* <Box>
          <Listbox movies={movies} />
        </Box>
        <Box>
          <Watchedsummary watched={watched} />
          <Watchedlistbox watched={watched} />
        </Box> */}
        {/* ///////////////////////////////////OR/////////////////////////// */}
        {/* //////////////////////////////// Explicitly Pass a child///////////////// */}
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <Listbox movies={movies} onSelectedMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDeatils
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAdd={handleWatchedMovies}
              watched={watched}
            />
          ) : (
            <>
              <Watchedsummary watched={watched} />
              <Watchedlistbox
                watched={watched}
                onDelete={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

export default App;

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function LogoText() {
  return (
    <div className="logo">
      <img src="/image.png" alt="logo" className="logoimg" />
      <h1>MovieMania</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputElement = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputElement.current) {
          return;
        }
        if (e.code === "Enter") {
          inputElement.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      inputElement.current.focus();
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      value={query}
      placeholder="Search movies..."
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="loader">
      <span>❌</span>
      {message}
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading..</p>;
}

function Numresults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong>{" "}
      {movies.length > 1 ? "movies" : "movie"}
    </p>
  );
}

function Main({ children }) {
  return <div className="main">{children}</div>;
}

function Box({ children }) {
  const [isOpen, setisOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setisOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Listbox({ movies, onSelectedMovie }) {
  return (
    <>
      <ul className="list list-movies">
        {movies.map((movies) => (
          <Lists
            movies={movies}
            key={movies.imdbID}
            onSelectedMovie={onSelectedMovie}
          />
        ))}
      </ul>
    </>
  );
}
function Lists({ movies, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movies.imdbID)}>
      <img src={movies.Poster} alt={`${movies.Title} poster`} />
      <h3>{movies.Title}</h3>
      <div>
        <p>
          <span>🗓️</span>
          <span>{movies.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDeatils({ selectedId, onCloseMovie, onAdd, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const isWatched = watched.map((movie) => movie.imdbId).includes(selectedId);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function handleAddToList() {
    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split(" ").at(0),
      Poster: poster,
      userRating,
    };
    onAdd(newWatchedMovie);
  }
  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callBack);
      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie|${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating size={20} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={() => {
                        handleAddToList();
                        onCloseMovie();
                      }}
                    >
                      Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You have already rated this movie</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring{actors}</p>
            <p>Directed By {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Watchedsummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>MOVIES YOU WATCHED</h2>
      <div>
        <p>
          <span>🎬</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>

        <p>
          <span>⌛</span>
          <span>{avgRuntime.toFixed(1)} mins</span>
        </p>
      </div>
    </div>
  );
}
function Watchedlistbox({ watched, onDelete }) {
  return (
    <>
      <ul className="list">
        {watched.map((movies) => (
          <Watchedlists
            movies={movies}
            key={movies.imdbId}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </>
  );
}
function Watchedlists({ movies, onDelete }) {
  return (
    <li>
      <img src={movies.Poster} alt={`${movies.title} poster`} />
      <h3>{movies.title}</h3>
      <div>
        <p>
          <span>⭐</span>
          <span>{movies.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movies.userRating}</span>
        </p>
        <p>
          <span>⌛</span>
          <span>{movies.runtime}</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movies.imdbId)}>
          X
        </button>
      </div>
    </li>
  );
}
