import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "../styles/PageTransitionLoader.css";

function PageTransitionLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) {
    return null;
  }

  return (
    <div className="page-transition-loader">
      <div className="page-transition-loader-spinner"></div>
    </div>
  );
}

export default PageTransitionLoader;
