import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "../styles/SearchBar.css";

function SearchBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const searchTerm = search.trim();

    if (!searchTerm) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <nav className="search-bar">
      <form className="search-bar-container" onSubmit={handleSearch}>
        <Search className="search-bar-icon" />

        <input
          className="search-bar-input"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          aria-label="Search products"
        />
      </form>
    </nav>
  );
}

export default SearchBar;
