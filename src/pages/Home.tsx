import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

type OmdbMovie = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
};

type OmdbSearchResponse = {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
};

const BASE = import.meta.env.VITE_OMDB_BASE_URL as string;
const KEY = import.meta.env.VITE_OMDB_API_KEY as string;
const HISTORY_KEY = "search_history";
const PAGE_SIZE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [history, setHistory] = useState<string[]>(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  });

  const url = KEY && BASE && searchTerm
    ? `${BASE}?apikey=${KEY}&s=${encodeURIComponent(searchTerm)}&type=movie&page=${page}`
    : null;

  const { data, loading, error } = useFetch<OmdbSearchResponse>(url);

  if (!KEY || !BASE) {
    return (
      <div className="page">
        <section className="panel">
          <h1>Movie Search</h1>
          <p className="status-error">
            Missing `VITE_OMDB_API_KEY` or `VITE_OMDB_BASE_URL` in `.env`.
          </p>
        </section>
      </div>
    );
  }

  function saveSearchTerm(term: string) {
    if (!term) return;

    setHistory((prev) => {
      const next = [
        term,
        ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    setSearchTerm(term);
    setPage(1);
    saveSearchTerm(term);
  }

  function runHistorySearch(term: string) {
    setQuery(term);
    setSearchTerm(term);
    setPage(1);
  }

  const apiMessage = data?.Response === "False" ? data.Error ?? "No results." : null;
  const movies = data?.Response === "True" ? data.Search ?? [] : [];
  const totalResults = Number.parseInt(data?.totalResults ?? "0", 10) || 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  return (
    <div className="page">
      <section className="panel">
        <h1 className="title">Movie Search</h1>
        <p className="subtitle">
          Enter a movie title to see a detail card for that movie.
        </p>

        <form className="search-form" onSubmit={onSearchSubmit}>
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies (for example: Batman)"
            aria-label="Movie title"
          />
          <button className="button-primary" type="submit" disabled={!query.trim()}>
            Search
          </button>
        </form>

        {history.length > 0 && (
          <div className="history">
            <p className="history-label">Recent searches</p>
            <div className="chip-row">
              {history.map((term) => (
                <button
                  key={term}
                  className="chip"
                  type="button"
                  onClick={() => runHistorySearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="results">
          {!searchTerm && <p className="status-note">Start by searching for a movie title.</p>}
          {loading && <p className="status-note">Loading...</p>}
          {error && <p className="status-error">{error}</p>}
          {!loading && apiMessage && <p className="status-note">{apiMessage}</p>}

          {movies.length > 0 && (
            <>
              <div className="result-summary">
                <p>
                  Showing page {page} of {totalPages} ({totalResults} total results)
                </p>
              </div>

              <div className="movie-grid">
                {movies.map((movie) => (
                  <Link key={movie.imdbID} to={`/movie/${movie.imdbID}`} className="movie-card">
                    <div className="movie-meta">
                      <strong>{movie.Title}</strong>
                      <span>{movie.Year}</span>
                    </div>
                    {movie.Poster !== "N/A" ? (
                      <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
                    ) : (
                      <div className="poster-empty">No Poster</div>
                    )}
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="page-count">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
