function CutSelectionSummary({ selectedCuts }) {
  return (
    <div className="cut-selection-summary">
      <div className="cut-selection-summary-header">
        <h3>Your Selected Cuts</h3>

        <span>{selectedCuts.length} selected</span>
      </div>

      {selectedCuts.length === 0 ? (
        <p className="cut-selection-empty">No custom cuts selected yet.</p>
      ) : (
        <ul className="cut-selection-list">
          {selectedCuts.map((cut) => {
            const parts = cut.split("-");

            const side = parts[0];
            const quarter = parts[1];
            const name = parts.slice(2).join("-");

            return (
              <li key={cut}>
                <span>
                  Side {side} —{" "}
                  {quarter === "front" ? "Front Quarter" : "Hind Quarter"}
                </span>

                <strong>{name}</strong>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CutSelectionSummary;
