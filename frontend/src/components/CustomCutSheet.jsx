import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api";
import CutSection from "./CutSection";
import "../styles/CustomCutSheet.css";

const FRONT_CUTS = [
  "Brisket",
  "Chuck",
  "Short Ribs",
  "Rib Steak",
  "Rib Eye",
  "Prime Rib",
  "Stew Meat",
  "Soup Shanks",
  "Soup Bones",
];

const HIND_CUTS = [
  "T-Bone",
  "Sirloin",
  "Rump Steak",
  "Leg Roasts",
  "Ground Beef",
  "Soup Bones",
];

function CustomCutSheet({
  productName,
  selectedCuts,
  setSelectedCuts,
  selectedQuarter,
  setSelectedQuarter,
  onSelectionsChange,
  remainingMeatPreferences,
  setRemainingMeatPreferences,
  specialInstructions,
  setSpecialInstructions,
}) {
  const [cutOptions, setCutOptions] = useState([]);

  // Determine the product carcass type.
  const productType = useMemo(() => {
    const name = productName.toLowerCase();

    if (name.includes("quarter")) {
      return "quarter";
    }

    if (name.includes("half")) {
      return "half";
    }

    return "full";
  }, [productName]);

  // Load available cut options from the API.
  useEffect(() => {
    const fetchCutOptions = async () => {
      try {
        const { data } = await api.get("/api/cut-options");

        const options = Array.isArray(data)
          ? data
          : data.cut_options || data.data || [];

        setCutOptions(options);
      } catch (error) {
        console.error("Failed to load cut options:", error);
      }
    };

    fetchCutOptions();
  }, []);

  // Find a cut option by quarter and name.
  const getCutOption = useCallback(
    (quarter, cutName) => {
      return cutOptions.find(
        (option) => option.quarter === quarter && option.name === cutName,
      );
    },
    [cutOptions],
  );

  // Toggle a cut selection.
  const toggleCut = (side, quarter, cut) => {
    const key = `${side}-${quarter}-${cut}`;

    const isRibSelection = ["Rib Steak", "Rib Eye", "Prime Rib"].includes(cut);

    setSelectedCuts((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }

      if (isRibSelection) {
        const ribOptions = ["Rib Steak", "Rib Eye", "Prime Rib"];

        const filtered = current.filter((item) => {
          const selectedCut = item.split("-").slice(2).join("-");
          return !ribOptions.includes(selectedCut);
        });

        return [...filtered, key];
      }

      return [...current, key];
    });
  };

  // Get selected cuts for a specific section.
  const getCutsForSection = (side, quarter) => {
    const prefix = `${side}-${quarter}-`;

    return selectedCuts
      .filter((item) => item.startsWith(prefix))
      .map((item) => item.replace(prefix, ""));
  };

  // Convert selected cuts into API-ready selections.
  const getSelectedCutSelections = useCallback(() => {
    const selections = selectedCuts
      .map((item) => {
        const firstDash = item.indexOf("-");
        const secondDash = item.indexOf("-", firstDash + 1);

        const side = item.substring(0, firstDash);
        const quarter = item.substring(firstDash + 1, secondDash);
        const cutName = item.substring(secondDash + 1);

        const cutOption = cutOptions.find(
          (option) => option.name === cutName && option.quarter === quarter,
        );

        if (!cutOption) {
          return null;
        }

        return {
          cut_option_id: cutOption.id,
          side,
          quarter,
        };
      })
      .filter(Boolean);

    // Add mandatory Soup Bones only if they are not already selected.
    const requiredQuarters =
      productType === "quarter"
        ? selectedQuarter
          ? [selectedQuarter]
          : []
        : ["front", "hind"];

    requiredQuarters.forEach((quarter) => {
      const soupBones = cutOptions.find(
        (option) => option.name === "Soup Bones" && option.quarter === quarter,
      );

      if (!soupBones) {
        return;
      }

      const requiredSides = productType === "full" ? ["A", "B"] : ["A"];

      requiredSides.forEach((side) => {
        const alreadySelected = selections.some(
          (selection) =>
            selection.cut_option_id === soupBones.id &&
            selection.side === side &&
            selection.quarter === quarter,
        );

        if (!alreadySelected) {
          selections.push({
            cut_option_id: soupBones.id,
            side,
            quarter,
          });
        }
      });
    });

    return selections;
  }, [selectedCuts, cutOptions, productType, selectedQuarter]);

  // Send updated selections to the parent component.
  useEffect(() => {
    const selections = getSelectedCutSelections();

    onSelectionsChange(selections);
  }, [getSelectedCutSelections, onSelectionsChange]);

  // Render an individual cut section.
  const renderSection = (side, quarter, cuts) => {
    let disabled = false;
    let disabledMessage = "";

    if (productType === "half" && side === "B") {
      disabled = true;
      disabledMessage = "Not available for half carcass";
    }

    if (productType === "quarter") {
      if (selectedQuarter === null) {
        disabled = true;
        disabledMessage = "Select Front or Hind Quarter";
      } else if (selectedQuarter !== quarter || side === "B") {
        disabled = true;
        disabledMessage = "Not selected";
      }
    }

    return (
      <CutSection
        key={`${side}-${quarter}`}
        title={`${side === "A" ? "Side A" : "Side B"} — ${
          quarter === "front" ? "Front Quarter" : "Hind Quarter"
        }`}
        cuts={cuts}
        selectedCuts={getCutsForSection(side, quarter)}
        onCutToggle={(cut) => toggleCut(side, quarter, cut)}
        disabled={disabled}
        disabledMessage={disabledMessage}
      />
    );
  };

  return (
    <section
      className="custom-cut-sheet"
      data-selected-quarter={selectedQuarter || ""}
    >
      <div className="custom-cut-sheet-heading">
        <h2>Custom Cut Sheet</h2>

        <p>
          Select the cuts you would like from the available sections. Soup bones
          are included with every quarter.
        </p>
      </div>

      {productType === "quarter" && (
        <div className="quarter-selector">
          <h3>Select your quarter</h3>

          <div className="quarter-selector-options">
            <button
              type="button"
              className={`quarter-selector-option ${
                selectedQuarter === "front"
                  ? "quarter-selector-option--selected"
                  : ""
              }`}
              onClick={() => {
                setSelectedQuarter("front");
                setSelectedCuts([]);
              }}
            >
              <span>{selectedQuarter === "front" ? "●" : "○"}</span>

              <strong>Front Quarter</strong>
            </button>

            <button
              type="button"
              className={`quarter-selector-option ${
                selectedQuarter === "hind"
                  ? "quarter-selector-option--selected"
                  : ""
              }`}
              onClick={() => {
                setSelectedQuarter("hind");
                setSelectedCuts([]);
              }}
            >
              <span>{selectedQuarter === "hind" ? "●" : "○"}</span>

              <strong>Hind Quarter</strong>
            </button>
          </div>
        </div>
      )}

      <div className="cut-sheet-grid">
        {renderSection("A", "front", FRONT_CUTS)}
        {renderSection("B", "front", FRONT_CUTS)}
        {renderSection("A", "hind", HIND_CUTS)}
        {renderSection("B", "hind", HIND_CUTS)}
      </div>

      <div className="remaining-meat-section">
        <div className="remaining-meat-heading">
          <h3>Remaining Meat</h3>

          <p>
            Select how you would like suitable remaining meat to be processed.
          </p>
        </div>

        <div className="remaining-meat-options">
          <label className="remaining-meat-option">
            <input
              type="checkbox"
              value="steaks"
              checked={remainingMeatPreferences.includes("steaks")}
              onChange={(event) => {
                const value = event.target.value;

                setRemainingMeatPreferences((current) => {
                  if (current.includes(value)) {
                    return current.filter((item) => item !== value);
                  }

                  return [
                    ...current.filter((item) => item !== "butcher_choice"),
                    value,
                  ];
                });
              }}
            />

            <span>Standard steaks where possible</span>
          </label>

          <label className="remaining-meat-option">
            <input
              type="checkbox"
              value="stew"
              checked={remainingMeatPreferences.includes("stew")}
              onChange={(event) => {
                const value = event.target.value;

                setRemainingMeatPreferences((current) => {
                  if (current.includes(value)) {
                    return current.filter((item) => item !== value);
                  }

                  return [
                    ...current.filter((item) => item !== "butcher_choice"),
                    value,
                  ];
                });
              }}
            />

            <span>Stew meat</span>
          </label>

          <label className="remaining-meat-option">
            <input
              type="checkbox"
              value="mince"
              checked={remainingMeatPreferences.includes("mince")}
              onChange={(event) => {
                const value = event.target.value;

                setRemainingMeatPreferences((current) => {
                  if (current.includes(value)) {
                    return current.filter((item) => item !== value);
                  }

                  return [
                    ...current.filter((item) => item !== "butcher_choice"),
                    value,
                  ];
                });
              }}
            />

            <span>Mince / Ground Beef</span>
          </label>

          <label className="remaining-meat-option">
            <input
              type="checkbox"
              value="butcher_choice"
              checked={remainingMeatPreferences.includes("butcher_choice")}
              onChange={(event) => {
                const value = event.target.value;

                setRemainingMeatPreferences((current) => {
                  if (current.includes(value)) {
                    return [];
                  }

                  return ["butcher_choice"];
                });
              }}
            />

            <span>Butcher's Choice</span>
          </label>
        </div>
      </div>

      <div className="special-instructions-section">
        <div className="special-instructions-heading">
          <h3>Special Instructions</h3>

          <p>Add any specific preparation or packaging requests.</p>
        </div>

        <textarea
          className="special-instructions-input"
          value={specialInstructions}
          onChange={(event) => setSpecialInstructions(event.target.value)}
          maxLength={2000}
          placeholder="For example: Please cut steaks approximately 2.5 cm thick."
        />

        <small className="special-instructions-limit">
          Maximum 2000 characters.
        </small>
      </div>
    </section>
  );
}

export default CustomCutSheet;
