import { useEffect, useState } from "react";
import { FiImage, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import api from "../api";
import productImage from "../utils/productImage";
import { Modal } from "./ui";

const GRADES = ["A", "AB", "B", "C"];
const MAX_IMAGE_MB = 2;
export default function CarcassProductFormModal({
  product = null,
  animalType = "Beef",
  categories = [],
  onClose,
  onBack,
  onSaved,
}) {
  const editing = Boolean(product);
  const isBeef = animalType.toLowerCase() === "beef";

  const initialCategories = Array.isArray(product?.category)
    ? product.category
    : product?.category
      ? [product.category]
      : [];

  const [form, setForm] = useState({
    name: product?.name ?? `${animalType} Carcass`,
    description: product?.description ?? "",
    category: initialCategories,
    status: product?.status ?? "published",
    is_active: product?.is_active ?? true,
    variants: product?.variants?.length
      ? product.variants.map((variant) => ({
          id: variant.id,
          grade: variant.grade ?? "",
          weight_min_kg: variant.weight_min_kg ?? "",
          weight_max_kg: variant.weight_max_kg ?? "",
          price: variant.price ?? "",
          stock: variant.stock ?? 0,
          is_active: variant.is_active ?? true,
        }))
      : [
          {
            grade: "",
            weight_min_kg: "",
            weight_max_kg: "",
            price: "",
            stock: 0,
            is_active: true,
          },
        ],
  });

  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    product ? productImage(product) : null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const update = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  // Free the temporary preview URL when it changes.
  useEffect(
    () => () => {
      if (image && preview) URL.revokeObjectURL(preview);
    },
    [image, preview],
  );
  // Update a single carcass variant.
  const updateVariant = (index, field, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));

    setErrors((current) => ({
      ...current,
      [`variants.${index}.${field}`]: undefined,
    }));
  };

  // Add another carcass variant.
  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          grade: "",
          weight_min_kg: "",
          weight_max_kg: "",
          price: "",
          stock: 0,
          is_active: true,
        },
      ],
    }));
  };

  // Remove a carcass variant.
  const removeVariant = (index) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  };

  // Add a category without creating duplicate entries.
  const addCategory = () => {
    const category = newCategory.trim();

    if (!category) return;

    setForm((current) => ({
      ...current,
      category: current.category.some(
        (item) => item.toLowerCase() === category.toLowerCase(),
      )
        ? current.category
        : [...current.category, category],
    }));

    setNewCategory("");
    setErrors((current) => ({ ...current, category: undefined }));
  };

  // Remove a category from the carcass product.
  const removeCategory = (category) => {
    setForm((current) => ({
      ...current,
      category: current.category.filter((item) => item !== category),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const body = new FormData();

    body.append("animal_type", animalType);
    body.append("name", form.name);
    body.append("description", form.description || "");
    body.append("status", form.status);
    body.append("is_active", form.is_active ? "1" : "0");

    form.category.forEach((category) => {
      body.append("category[]", category);
    });

    form.variants.forEach((variant, index) => {
      Object.entries({
        ...variant,
        grade: isBeef ? variant.grade : "",
        weight_min_kg: variant.weight_min_kg,
        weight_max_kg: variant.weight_max_kg,
        price: variant.price,
        stock: variant.stock,
        is_active: variant.is_active ? "1" : "0",
      }).forEach(([key, value]) => {
        body.append(`variants[${index}][${key}]`, value ?? "");
      });
    });

    if (image) body.append("image", image);
    if (removeImage) body.append("remove_image", "1");
    if (editing) body.append("_method", "PUT");

    try {
      const url = editing
        ? `/api/admin/carcass-products/${product.id}`
        : "/api/admin/carcass-products";

      const { data } = await api.post(url, body);
      onSaved(data, editing);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;

      setErrors(
        fieldErrors
          ? Object.fromEntries(
              Object.entries(fieldErrors).map(([key, value]) => [
                key,
                value[0],
              ]),
            )
          : { form: "Couldn't save the carcass product. Try again." },
      );

      setSaving(false);
    }
  };
  // Select and preview the parent product image.
  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: `Image must be ${MAX_IMAGE_MB} MB or smaller.`,
      }));
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setErrors((current) => ({ ...current, image: undefined }));
  };

  // Remove the parent product image.
  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setRemoveImage(true);
  };
  const inputError = (field) =>
    errors[field] ? (
      <small className="adm-field__error">{errors[field]}</small>
    ) : null;

  return (
    <Modal
      title={editing ? `Edit ${product.name}` : `Add ${animalType} Carcass`}
      onClose={onClose}
      onBack={onBack}
      width={720}
    >
      <form className="adm-form" onSubmit={save} noValidate>
        <div className="adm-imgpick">
          <div className="adm-imgpick__box">
            {preview ? (
              <img src={preview} alt="" />
            ) : (
              <FiImage aria-hidden="true" />
            )}
          </div>

          <div className="adm-imgpick__actions">
            <label className="adm-btn adm-btn--outline adm-btn--file">
              {preview ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={pickImage}
              />
            </label>

            {preview && (
              <button
                type="button"
                className="adm-linkbtn"
                onClick={clearImage}
              >
                <FiX aria-hidden="true" /> Remove
              </button>
            )}

            <small className="adm-form__hint">
              JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB
            </small>

            {errors.image && (
              <small className="adm-field__error">{errors.image}</small>
            )}
          </div>
        </div>
        <div className="adm-grid2">
          <label className="adm-field adm-field--full">
            <span>Carcass product name</span>
            <input
              name="name"
              value={form.name}
              onChange={update}
              className={errors.name ? "has-error" : ""}
            />
            {inputError("name")}
          </label>

          <div className="adm-field adm-field--full">
            <span>Categories</span>

            <div className="adm-category-list">
              {form.category.map((category) => (
                <span className="adm-category-tag" key={category}>
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    aria-label={`Remove ${category}`}
                  >
                    <FiX aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>

            <div className="adm-category-add">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
                list="carcass-category-options"
                placeholder="Select or type a category"
              />

              <datalist id="carcass-category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>

              <button
                type="button"
                className="adm-btn adm-btn--outline"
                onClick={addCategory}
              >
                Add
              </button>
            </div>

            {inputError("category")}
          </div>
        </div>

        <label className="adm-field">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={3}
            className={errors.description ? "has-error" : ""}
          />
          {inputError("description")}
        </label>

        <div className="adm-form__section">
          <div className="adm-form__section-header">
            <div>
              <strong>Carcass variants</strong>
              <small>
                Set the weight range, price and available stock for each
                variant.
              </small>
            </div>

            <button
              type="button"
              className="adm-btn adm-btn--outline"
              onClick={addVariant}
            >
              <FiPlus aria-hidden="true" /> Add variant
            </button>
          </div>

          {form.variants.map((variant, index) => (
            <div className="adm-variant-card" key={variant.id ?? index}>
              <div className="adm-variant-card__header">
                <strong>Variant {index + 1}</strong>

                {form.variants.length > 1 && (
                  <button
                    type="button"
                    className="adm-linkbtn"
                    onClick={() => removeVariant(index)}
                    aria-label={`Remove variant ${index + 1}`}
                  >
                    <FiTrash2 aria-hidden="true" /> Remove
                  </button>
                )}
              </div>

              <div className="adm-grid2">
                {isBeef && (
                  <label className="adm-field">
                    <span>Grade</span>
                    <select
                      value={variant.grade}
                      onChange={(e) =>
                        updateVariant(index, "grade", e.target.value)
                      }
                    >
                      <option value="">Select grade</option>
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    {inputError(`variants.${index}.grade`)}
                  </label>
                )}

                <label className="adm-field">
                  <span>Minimum weight (kg)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.weight_min_kg}
                    onChange={(e) =>
                      updateVariant(index, "weight_min_kg", e.target.value)
                    }
                  />
                  {inputError(`variants.${index}.weight_min_kg`)}
                </label>

                <label className="adm-field">
                  <span>Maximum weight (kg)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.weight_max_kg}
                    onChange={(e) =>
                      updateVariant(index, "weight_max_kg", e.target.value)
                    }
                  />
                  {inputError(`variants.${index}.weight_max_kg`)}
                </label>

                <label className="adm-field">
                  <span>Price (R)</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, "price", e.target.value)
                    }
                    className={
                      errors[`variants.${index}.price`] ? "has-error" : ""
                    }
                  />
                  {inputError(`variants.${index}.price`)}
                </label>

                <label className="adm-field">
                  <span>Stock (units)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", e.target.value)
                    }
                    className={
                      errors[`variants.${index}.stock`] ? "has-error" : ""
                    }
                  />
                  {inputError(`variants.${index}.stock`)}
                </label>
              </div>

              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={variant.is_active}
                  onChange={(e) =>
                    updateVariant(index, "is_active", e.target.checked)
                  }
                />
                Variant available for purchase
              </label>
            </div>
          ))}

          {inputError("variants")}
        </div>

        <label className="adm-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={update}>
            <option value="published">Published (visible in the shop)</option>
            <option value="draft">Draft (hidden, not ready yet)</option>
          </select>
        </label>

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
            {saving ? "Saving…" : editing ? "Save changes" : "Add carcass"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
