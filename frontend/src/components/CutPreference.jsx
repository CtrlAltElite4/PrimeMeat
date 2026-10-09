function CutPreference({
  cutType,
  onCutTypeChange,
  customSheetOpen,
  onToggleCustomSheet,
}) {
  return (
    <section className="cut-preference">
      <div className="cut-preference-heading">
        <h2>How would you like your carcass cut?</h2>

        <p>
          Choose between our traditional preparation or select your own cuts.
        </p>
      </div>

      <div className="cut-preference-options">
        <button
          type="button"
          className={`cut-preference-option ${
            cutType === "traditional" ? "cut-preference-option--selected" : ""
          }`}
          onClick={() => onCutTypeChange("traditional")}
        >
          <span className="cut-preference-radio">
            {cutType === "traditional" ? "●" : "○"}
          </span>

          <span className="cut-preference-content">
            <strong>Traditional Cuts</strong>

            <span>
              Standard butcher preparation with normal steaks, stew meat, soup
              bones, roasts and other traditional cuts.
            </span>
          </span>
        </button>

        <button
          type="button"
          className={`cut-preference-option ${
            cutType === "custom" ? "cut-preference-option--selected" : ""
          }`}
          onClick={() => {
            onCutTypeChange("custom");
            onToggleCustomSheet();
          }}
        >
          <span className="cut-preference-radio">
            {cutType === "custom" ? "●" : "○"}
          </span>

          <span className="cut-preference-content">
            <strong>Custom Cuts</strong>

            <span>
              Choose the specific cuts you want from the available options.
            </span>
          </span>
        </button>
      </div>

      {cutType === "custom" && (
        <button
          type="button"
          className="cut-sheet-toggle"
          onClick={onToggleCustomSheet}
          aria-expanded={customSheetOpen}
        >
          <span>Custom Cut Sheet</span>

          <span className="cut-sheet-toggle-icon">
            {customSheetOpen ? "−" : "+"}
          </span>
        </button>
      )}
    </section>
  );
}

export default CutPreference;
