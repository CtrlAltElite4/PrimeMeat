import { useEffect } from "react";

function ScrollReveal() {
  useEffect(() => {
    const main = document.querySelector(".main-content");

    if (!main) {
      return;
    }

    const selectors = [
      "section",
      "article",
      "form",
      "figure",
      ".product-card",
      ".product-grid",
      ".products-grid",
      ".products-container",
      ".filter-bar",
      ".home-filter-bar",
      ".featured-products",
      ".about-section",
      ".contact-section",
      ".group-order-section",
      ".content-section",
    ];

    const getElements = () => {
      const elements = main.querySelectorAll(selectors.join(", "));

      elements.forEach((element) => {
        if (
          element.closest(".chatbot") ||
          element.closest(".navbar") ||
          element.classList.contains("scroll-reveal")
        ) {
          return;
        }

        element.classList.add("scroll-reveal");
      });

      return main.querySelectorAll(".scroll-reveal");
    };

    const observeElements = () => {
      const elements = getElements();

      elements.forEach((element) => {
        observer.observe(element);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}

export default ScrollReveal;
