function CutSelectionSummary({ selectedCuts }) {
  const sides = ["A", "B"];
  const quarters = [
    { id: "front", label: "Front Quarter" },
    { id: "hind", label: "Hind Quarter" },
  ];

  const groupedCuts = sides
    .map((side) => ({
      side,
      quarters: quarters
        .map((quarter) => ({
          ...quarter,
          cuts: selectedCuts
            .map((cut) => {
              const parts = cut.split("-");
              return {
                id: cut,
                side: parts[0],
                quarter: parts[1],
                name: parts.slice(2).join("-"),
              };
            })
            .filter((cut) => cut.side === side && cut.quarter === quarter.id),
        }))
        .filter((quarter) => quarter.cuts.length > 0),
    }))
    .filter((side) => side.quarters.length > 0);

  return (
    <div className="cut-selection-summary">
      <div className="cut-selection-summary-header">
        <h3>Your Selected Cuts</h3>
        <span>{selectedCuts.length} selected</span>
      </div>

      {selectedCuts.length === 0 ? (
        <p className="cut-selection-empty">No custom cuts selected yet.</p>
      ) : (
        <div className="cut-selection-grid">
          {groupedCuts.map((side) => (
            <section className="cut-selection-side" key={side.side}>
              <h4>Side {side.side}</h4>

              {side.quarters.map((quarter) => (
                <div className="cut-selection-quarter" key={quarter.id}>
                  <h5>{quarter.label}</h5>

                  <ul className="cut-selection-list">
                    {quarter.cuts.map((cut) => (
                      <li key={cut.id}>{cut.name.replace(/-/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default CutSelectionSummary;
