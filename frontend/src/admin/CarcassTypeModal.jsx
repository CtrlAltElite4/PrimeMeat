import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Modal } from "./ui";

const ANIMAL_TYPES = ["Beef", "Lamb", "Mutton"];

export default function CarcassTypeModal({ onSelect, onClose, onBack }) {
  const [newAnimal, setNewAnimal] = useState("");

  // Add a custom animal type without restricting future options.
  const addAnimal = () => {
    const animal = newAnimal.trim();

    if (!animal) return;

    onSelect(animal);
  };

  return (
    <Modal
      title="Choose Carcass Type"
      onClose={onClose}
      onBack={onBack}
      width={760}
    >
      <div className="adm-product-types">
        {ANIMAL_TYPES.map((animal) => (
          <button
            key={animal}
            type="button"
            className="adm-product-type"
            onClick={() => onSelect(animal)}
          >
            <span className="adm-product-type__content">
              <strong>{animal} Carcass</strong>
              <small>
                {animal === "Beef"
                  ? "Use the existing beef form with grade selection."
                  : "Create a carcass product without grade selection."}
              </small>
            </span>
          </button>
        ))}
      </div>

      <div className="adm-animal-custom">
        <div className="adm-animal-custom__heading">
          <strong>Other animal type</strong>
          <small>Don't see the animal you're looking for? Add your own.</small>
        </div>

        <div className="adm-animal-custom__input">
          <input
            value={newAnimal}
            onChange={(e) => setNewAnimal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAnimal();
              }
            }}
            placeholder="e.g. Goat, Venison or Pork"
            aria-label="New carcass animal type"
          />

          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={addAnimal}
            disabled={!newAnimal.trim()}
          >
            <FiPlus aria-hidden="true" /> Add type
          </button>
        </div>
      </div>
    </Modal>
  );
}
