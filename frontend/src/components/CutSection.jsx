function CutSection({
  title,
  cuts,
  selectedCuts,
  onCutToggle,
  disabled = false,
  disabledMessage = "",
}) {
  return (
    <section
      className={`cut-section ${disabled ? "cut-section--disabled" : ""}`}
    >
      <div className="cut-section-header">
        <h3>{title}</h3>

        {disabled && disabledMessage && (
          <span className="cut-section-disabled-message">
            {disabledMessage}
          </span>
        )}
      </div>

      <div className="cut-options">
        {cuts.map((cut) => {
          const isSoupBone = cut === "Soup Bones";
          const isSelected = selectedCuts.includes(cut);

          return (
            <label
              key={cut}
              className={`cut-option ${disabled ? "cut-option--disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSoupBone || isSelected}
                disabled={disabled || isSoupBone}
                onChange={() => onCutToggle(cut)}
              />

              <span>{cut}</span>

              {isSoupBone && (
                <small className="cut-option-included">Included</small>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default CutSection;
