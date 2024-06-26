import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import "./styles.css";
import "./promise.css";
import { ReactComponent as BannerSVG } from "./images/banner.svg";
import CustomTooltip from "./CustomTooltip";
import Popular from "./images/Popular.svg";
import Featured from "./images/Featured.svg";
import PromiseSection from "./images/Promise.svg";
import Prices from "./images/Prices.svg";
import Privacy from "./images/Privacy.svg";
import Fast from "./images/fast.svg";
import Service from "./images/service.svg";

const genres = [
  { title: "History", link: "history" },
  { title: "Romance", link: "love" },
  { title: "Science Fiction", link: "science-fiction" },
  { title: "Fantasy", link: "fantasy" },
];

const items = [
  { src: Prices, alt: "Prices" },
  { src: Privacy, alt: "Privacy" },
  { src: Fast, alt: "Fast" },
  { src: Service, alt: "Service" },
];

const Home = ({ handleAddToCart, handleImageClick }) => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("history");
  const [genreBooks, setGenreBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooksFromAPI = async (genre, numBooks = 12) => {
    try {
      const response = await axios.get(
        `https://openlibrary.org/subjects/${encodeURIComponent(
          genre
        )}.json?limit=${numBooks}`
      );
      return response.data.works.map((book) => ({
        id: book.cover_edition_key || book.key,
        title: book.title,
        authors: book.authors || [],
        cover_id: book.cover_id,
      }));
    } catch (error) {
      console.error(`Error fetching books from API:`, error);
      return [];
    }
  };

  const fetchBooksFromDB = async () => {
    try {
      const response = await axios.get("http://localhost:5002/api/books");
      return response.data;
    } catch (error) {
      console.error("Error fetching books from database:", error);
      return [];
    }
  };

  const mergeBookData = (dbBooks, apiBooks) => {
    const dbBooksMap = new Map();
    dbBooks.forEach((book) => dbBooksMap.set(book.title.toLowerCase(), book));

    return apiBooks
      .map((apiBook) => {
        const dbBook = dbBooksMap.get(apiBook.title.toLowerCase());
        if (dbBook) {
          return {
            ...apiBook,
            price: dbBook.price,
            quantity: dbBook.quantity,
            id: dbBook.id,
          };
        }
        return null;
      })
      .filter((book) => book !== null);
  };

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      setLoading(true);
      try {
        const dbBooks = await fetchBooksFromDB();
        const allBooksPromises = genres.map((genre) =>
          fetchBooksFromAPI(genre.link, 50)
        );
        const allBooks = await Promise.all(allBooksPromises);
        const flattenedBooks = allBooks.flat();
        const mergedBooks = mergeBookData(dbBooks, flattenedBooks);

        const uniqueBooks = new Map();
        for (const book of mergedBooks) {
          if (
            uniqueBooks.size < 4 &&
            !uniqueBooks.has(book.title.toLowerCase())
          ) {
            uniqueBooks.set(book.title.toLowerCase(), book);
          }
          if (uniqueBooks.size === 4) break;
        }

        setFeaturedBooks(Array.from(uniqueBooks.values()));
      } catch (error) {
        setError("Error fetching featured books");
        console.error(
          "Error fetching featured books:",
          error.message,
          error.stack
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const fetchGenreBooks = useCallback(async (genre) => {
    setLoading(true);
    setError(null);
    try {
      const dbBooks = await fetchBooksFromDB();
      const apiBooks = await fetchBooksFromAPI(genre, 50);
      const mergedBooks = mergeBookData(dbBooks, apiBooks);
      setGenreBooks(mergedBooks);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenreBooks("history");
  }, [fetchGenreBooks]);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    fetchGenreBooks(genre);
  };

  const handleAddToCartWithUniqueID = (book) => {
    handleAddToCart({ ...book, uniqueCartItemId: `${book.id}-${Date.now()}` });
  };

  return (
    <div
      className="MuiContainer-root MuiContainer-maxWidthLg content css-loqqzyl-MuiContainer-root"
      style={{ padding: "0 0 0 0" }}
    >
      <section id="banner">
        <BannerSVG style={{ width: "100%", height: "100%" }} />
      </section>

      <section id="featured-books" className="py-5 my-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-header align-center">
                <h2 className="section-title">
                  <img
                    src={Featured}
                    alt="Featured Books"
                    className="section-icon"
                  />
                </h2>
              </div>
              <div
                className="product-list"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                }}
              >
                {featuredBooks.map((book, index) => (
                  <div
                    key={book.id || `book-${index}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <CustomTooltip title="Click for more details">
                      <div
                        className="product-item"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <figure
                          className="product-style"
                          style={{ marginBottom: "15px" }}
                        >
                          <img
                            src={`https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`}
                            alt="Books"
                            className="product-item"
                            style={{
                              width: "100%",
                              height: "auto",
                              cursor: "pointer",
                            }}
                            onClick={() => handleImageClick(book)}
                          />
                          <button
                            type="button"
                            className="add-to-cart"
                            data-product-tile="add-to-cart"
                            onClick={() => handleAddToCartWithUniqueID(book)}
                          >
                            Add to Cart
                          </button>
                        </figure>
                        <figcaption style={{ textAlign: "center" }}>
                          <h3
                            className="book-title"
                            style={{
                              fontSize: "1.25rem",
                              marginBottom: "10px",
                            }}
                          >
                            {book.title}
                          </h3>
                          <span
                            style={{ display: "block", marginBottom: "10px" }}
                          >
                            {book.authors
                              .map((author) => author.name)
                              .join(", ")}
                          </span>
                          <div
                            className="item-price"
                            style={{ fontSize: "1.25rem", color: "#333" }}
                          >
                            ${book.price}
                          </div>
                          <Typography variant="body2" color="textSecondary">
                            Quantity: {book.quantity}
                          </Typography>
                        </figcaption>
                      </div>
                    </CustomTooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="promise-section">
        <div className="container">
          <div className="section-header align-center">
            <h2 className="section-title">
              <img
                src={PromiseSection}
                alt="Promise Section"
                className="section-icon"
              />
            </h2>
          </div>
          <div
            className="slider"
            style={{
              "--imageQuantity": items.length / 2,
            }}
          >
            <div className="list">
              {items.concat(items).map((item, index) => (
                <div className="item" key={index}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      width: "300px",
                      height: "300px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="popular-books" className="bookshelf py-5 my-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-header align-center">
                <div className="title">
                  <span>Listings</span>
                </div>
                <h2 className="section-title">
                  <img
                    src={Popular}
                    alt="Popular Books"
                    className="section-icon"
                  />
                </h2>
              </div>
              <ul className="tabs">
                {genres.map((genre) => (
                  <li key={genre.title} className="tab">
                    <button
                      onClick={() => handleGenreClick(genre.link)}
                      className={selectedGenre === genre.link ? "active" : ""}
                    >
                      {genre.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <div id="genre-books" className="py-5 my-5">
        <Container>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <div>Error fetching books: {error}</div>
          ) : (
            <Grid container spacing={4}>
              {genreBooks.map((book, index) => (
                <Grid
                  item
                  key={book.id || `genre-book-${index}`}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <CustomTooltip title="Click for more details">
                    <div
                      className="product-item"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <figure
                        className="product-style"
                        style={{ marginBottom: "15px" }}
                      >
                        <img
                          src={`https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`}
                          alt="Books"
                          className="product-item"
                          style={{
                            width: "100%",
                            height: "auto",
                            cursor: "pointer",
                          }}
                          onClick={() => handleImageClick(book)}
                        />

                        <button
                          type="button"
                          className="add-to-cart"
                          data-product-tile="add-to-cart"
                          onClick={() => handleAddToCartWithUniqueID(book)}
                        >
                          Add to Cart
                        </button>
                      </figure>
                      <figcaption style={{ textAlign: "center" }}>
                        <h3
                          className="book-title"
                          style={{ fontSize: "1.25rem", marginBottom: "10px" }}
                        >
                          {book.title}
                        </h3>
                        <span
                          style={{ display: "block", marginBottom: "10px" }}
                        >
                          {book.authors &&
                            book.authors
                              .map((author) => author.name)
                              .join(", ")}
                        </span>
                        <div
                          className="item-price"
                          style={{ fontSize: "1.25rem", color: "#333" }}
                        >
                          ${book.price}
                        </div>
                        <Typography variant="body2" color="textSecondary">
                          Quantity: {book.quantity}
                        </Typography>
                      </figcaption>
                    </div>
                  </CustomTooltip>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Home;
