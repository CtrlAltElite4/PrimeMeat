import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { GiSteak } from "react-icons/gi";
import { Modal } from "./ui";

const TYPES = [
  {
    id: "carcass",
    title: "Carcass",
    description: "Create a beef, lamb, mutton or other animal carcass product.",
    icon: GiSteak,
  },
  {
    id: "group_order",
    title: "Group Order Package",
    description: "Set a weight range, package price and available stock.",
    icon: FiPackage,
  },
  {
    id: "standard",
    title: "Other",
    description:
      "Create a fixed-price product and assign one or more categories.",
    icon: FiShoppingBag,
  },
];

export default function ProductTypeModal({ onSelect, onClose }) {
  return (
    <Modal title="Choose Product Type" onClose={onClose} width={760}>
      <div className="adm-product-types">
        {TYPES.map(({ id, title, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="adm-product-type"
            onClick={() => onSelect(id)}
          >
            <span className="adm-product-type__icon">
              <Icon aria-hidden="true" />
            </span>

            <span className="adm-product-type__content">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
