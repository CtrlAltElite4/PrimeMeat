import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "../styles/SearchBar.css";
function SearchBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = search.trim();

    if (!keyword) return;

    navigate(`/products?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-bar-container">
          <input
            type="search"
            className="search-bar-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <button type="submit" className="search-bar-button" aria-label="Search">
          <Search className="search-bar-icon" size={18} />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
