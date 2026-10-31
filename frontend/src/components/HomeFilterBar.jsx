import { NavLink } from "react-router-dom";
import "../styles/Home.css";

function HomeFilterBar() {
  const filters = [
    {
      name: "Beef Carcasses",
      value: "beef-carcasses",
      path: "/products?filter=beef-carcasses",
    },
    {
      name: "Beef Products",
      value: "beef-products",
      path: "/products?filter=beef-products",
    },
    {
      name: "Mutton Products",
      value: "mutton-products",
      path: "/products?filter=mutton-products",
    },
    {
      name: "Lamb Products",
      value: "lamb-products",
      path: "/products?filter=lamb-products",
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
