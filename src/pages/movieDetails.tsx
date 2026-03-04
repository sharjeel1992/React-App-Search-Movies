import { Link, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

type OmdbMovieDetail = {
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Plot?: string;
  Poster?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Response: "True" | "False";
  Error?: string;
};

const BASE = import.meta.env.VITE_OMDB_BASE_URL as string;
const KEY = import.meta.env.VITE_OMDB_API_KEY as string;

export default function MovieDetails() {
  const { imdbID } = useParams<{ imdbID: string }>();
  const url = KEY && BASE && imdbID ? `${BASE}?apikey=${KEY}&i=${imdbID}&plot=full` : null;
  const { data, loading, error } = useFetch<OmdbMovieDetail>(url);
  const apiMessage = data?.Response === "False" ? data.Error ?? "Movie not found." : null;

  if (!KEY || !BASE) {
    return (
      <div className="page">
        <section className="panel">
          <p className="status-error">
            Missing `VITE_OMDB_API_KEY` or `VITE_OMDB_BASE_URL` in `.env`.
          </p>
          <Link className="back-link" to="/">
            Back to Search
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="panel">
        <Link className="back-link" to="/">
          Back to Search
        </Link>

        {loading && <p className="status-note">Loading...</p>}
        {error && <p className="status-error">{error}</p>}
        {!loading && apiMessage && <p className="status-note">{apiMessage}</p>}

        {data && data.Response === "True" && (
          <div className="detail-layout">
            <div className="detail-content">
              <h1>{data.Title}</h1>
              <p className="status-note">
                {data.Year} | {data.Runtime} | Rated {data.Rated}
              </p>

              <dl className="detail-list">
                <div>
                  <dt>Released</dt>
                  <dd>{data.Released ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>{data.Genre ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>Director</dt>
                  <dd>{data.Director ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>Actors</dt>
                  <dd>{data.Actors ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>IMDb</dt>
                  <dd>
                    {data.imdbRating ?? "N/A"} ({data.imdbVotes ?? "0"} votes)
                  </dd>
                </div>
              </dl>

              <h2>Plot</h2>
              <p>{data.Plot ?? "No plot available."}</p>
            </div>

            {data.Poster && data.Poster !== "N/A" ? (
              <img src={data.Poster} alt={data.Title ?? "Movie poster"} className="detail-poster" />
            ) : (
              <div className="detail-poster detail-poster-empty">No Poster</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
