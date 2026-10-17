import { NavLink } from "react-router-dom";
import "../styles/Home.css";

function HomeFilterBar() {
  const filters = [
    {
      name: "Full Carcass",
      value: "full-carcass",
      path: "/products?filter=full-carcass",
    },
    {
      name: "Half Carcass",
      value: "half-carcass",
      path: "/products?filter=half-carcass",
    },
    {
      name: "Quarter Carcass",
      value: "quarter-carcass",
      path: "/products?filter=quarter-carcass",
    },
    {
      name: "Group Orders",
      value: "group-orders",
      path: "/group-orders",
    },
  ];

  return (
    <section className="home-filter-bar">
      <div className="home-filter-container">
        {filters.map((filter) => (
          <NavLink
            key={filter.value}
            className="home-filter-link"
            to={filter.path}
          >
            {filter.name}
          </NavLink>
        ))}
      </div>
    </section>
  );
}

export default HomeFilterBar;
