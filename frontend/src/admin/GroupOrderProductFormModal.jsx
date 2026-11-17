import { useState } from "react";
import api from "../api";
import { Modal } from "./ui";

export default function GroupOrderProductFormModal({
  product,
  onClose,
  onBack,
  onSaved,
}) {
  const editing = Boolean(product);

  const [form, setForm] = useState({
    weight_range: product?.weight_range ?? "",
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const url = editing
        ? `/api/admin/group-order-products/${product.id}`
        : "/api/admin/group-order-products";

      const { data } = editing
        ? await api.put(url, form)
        : await api.post(url, form);

      onSaved(data.group_order_product ?? data, editing);
    } catch (error) {
      const validationErrors = error.response?.data?.errors;

      setErrors(
        validationErrors
          ? Object.fromEntries(
              Object.entries(validationErrors).map(([key, value]) => [
                key,
                value[0],
              ]),
            )
          : {
              form:
                error.response?.data?.message ||
                "Could not save the package. Please try again.",
            },
      );
    } finally {
      setSaving(false);
    }
  };

  const input = (name, label, props = {}) => (
    <label className="adm-field">
      <span>{label}</span>
      <input
        name={name}
        value={form[name]}
        onChange={update}
        className={errors[name] ? "has-error" : ""}
        {...props}
      />
      {errors[name] && (
        <small className="adm-field__error">{errors[name]}</small>
      )}
    </label>
  );

  return (
    <Modal
      title={editing ? "Edit Group Order Package" : "Add Group Order Package"}
      onClose={onClose}
      onBack={onBack}
      width={520}
    >
      <form className="adm-form" onSubmit={save} noValidate>
        {input("weight_range", "Weight range (kg)", {
          type: "text",
          placeholder: "e.g. 200-240",
          maxLength: 100,
        })}

        {input("price", "Package price (R)", {
          type: "number",
          min: 0.01,
          step: "0.01",
          inputMode: "decimal",
        })}

        {input("stock", "Available packages", {
          type: "number",
          min: 0,
          step: 1,
          inputMode: "numeric",
        })}

        <label className="adm-check">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={update}
          />
          Available for purchase
        </label>

        {errors.form && (
          <p className="adm-alert" role="alert">
            {errors.form}
          </p>
        )}

        <div className="adm-form__actions">
          <button
            type="button"
            className="adm-btn adm-btn--outline"
            onClick={onClose}
          >
            Cancel
          </button>

          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add package"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
