import { useEffect, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import api from "../api";
import productImage from "../utils/productImage";
import { Modal } from "./ui";

const GRADES = ["A", "AB", "B", "C"];
const MAX_IMAGE_MB = 2;

/** Add or edit a product. Pass `product` to edit, leave it out to add. */
export default function ProductFormModal({
  product,
  categories = [],
  productType = "fixed_price",
  showGrade = true,
  onClose,
  onBack,
  onSaved,
}) {
  const editing = Boolean(product);

  // Convert existing category data into an array for editing.
  const initialCategories = Array.isArray(product?.category)
    ? product.category
    : product?.category
      ? [product.category]
      : [];

  const [form, setForm] = useState({
    name: product?.name ?? "",
    grade: product?.grade ?? "",
    category: initialCategories,
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    status: product?.status ?? "published",
    is_active: product?.is_active ?? true,
    product_type: product?.product_type ?? productType,
  });

  const [newCategory, setNewCategory] = useState("");
  const [image, setImage] = useState(null); // new file picked
  // Start with the same image the shop shows for this product
  const [preview, setPreview] = useState(
    product ? productImage(product) : null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState(
    (product?.variants ?? []).map((variant) => ({
      id: variant.id,
      grade: variant.grade ?? "",
      weight_kg: variant.weight_kg ?? "",
      price: variant.price ?? "",
      stock: variant.stock ?? 0,
      is_active: variant.is_active ?? true,
    })),
  );
  // Free the temporary preview URL when it changes
  useEffect(
    () => () => {
      if (image && preview) URL.revokeObjectURL(preview);
    },
    [image, preview],
  );

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };
  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        grade: "",
        weight_kg: "",
        price: "",
        stock: 0,
        is_active: true,
      },
    ]);
  };

  const updateVariant = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );

    setErrors((current) => ({
      ...current,
      [`variants.${index}.${field}`]: undefined,
    }));
  };

  const removeVariant = (index) => {
    setVariants((current) => current.filter((_, i) => i !== index));
  };
  // Add a category without creating duplicate entries.
  const addCategory = (value = newCategory) => {
    const category = value.trim();

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

  // Remove a category from the product.
  const removeCategory = (category) => {
    setForm((current) => ({
      ...current,
      category: current.category.filter((item) => item !== category),
    }));
  };
  const selectCategory = (e) => {
    const category = e.target.value;
    if (!category) return;

    addCategory(category);
  };
  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((errs) => ({
        ...errs,
        image: `Image must be ${MAX_IMAGE_MB} MB or smaller.`,
      }));
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setErrors((errs) => ({ ...errs, image: undefined }));
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setRemoveImage(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // FormData allows image uploads and multiple category values.
    const body = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "category") {
        value.forEach((category) => body.append("category[]", category));
      } else {
        body.append(
          key,
          typeof value === "boolean" ? (value ? "1" : "0") : value,
        );
      }
    });

    if (form.product_type === "fixed_price") {
      variants.forEach((variant, index) => {
        if (variant.id) {
          body.append(`variants[${index}][id]`, variant.id);
        }

        body.append(`variants[${index}][grade]`, variant.grade);
        body.append(`variants[${index}][weight_min_kg]`, variant.weight_min_kg);
        body.append(`variants[${index}][weight_max_kg]`, variant.weight_min_kg);
        body.append(`variants[${index}][price]`, variant.price);
        body.append(`variants[${index}][stock]`, variant.stock);
        body.append(
          `variants[${index}][is_active]`,
          variant.is_active ? "1" : "0",
        );
      });
    }

    if (image) body.append("image", image);
    if (removeImage) body.append("remove_image", "1");
    if (editing) body.append("_method", "PUT");

    try {
      const url = editing
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

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
          : { form: "Couldn't save the product. Try again." },
      );

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
      title={editing ? `Edit ${product.code}` : "Add product"}
      onClose={onClose}
      onBack={onBack}
      width={620}
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
          {input("name", "Product name")}

          {showGrade && (
            <label className="adm-field">
              <span>Grade</span>
              <input
                name="grade"
                value={form.grade}
                onChange={update}
                list="grade-options"
                className={errors.grade ? "has-error" : ""}
                placeholder="e.g. AB"
              />
              <datalist id="grade-options">
                {GRADES.map((grade) => (
                  <option key={grade} value={grade} />
                ))}
              </datalist>
              {errors.grade && (
                <small className="adm-field__error">{errors.grade}</small>
              )}
            </label>
          )}

          {/* Allow multiple categories to be assigned to one product. */}
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

              {form.category.length === 0 && (
                <small className="adm-form__hint">
                  No categories selected.
                </small>
              )}
            </div>

            <select
              value=""
              onChange={selectCategory}
              className="adm-category-select"
            >
              <option value="" disabled>
                Select an existing category
              </option>

              {categories
                .filter(
                  (category) =>
                    !form.category.some(
                      (selected) =>
                        selected.toLowerCase() === category.toLowerCase(),
                    ),
                )
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>

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
                placeholder="Enter a new category"
              />

              <button
                type="button"
                className="adm-btn adm-btn--outline"
                onClick={() => addCategory()}
              >
                Add category
              </button>
            </div>

            {errors.category && (
              <small className="adm-field__error">{errors.category}</small>
            )}

            {errors["category.0"] && (
              <small className="adm-field__error">{errors["category.0"]}</small>
            )}
          </div>

          {input("price", "Price (R)", {
            type: "number",
            min: 0,
            step: "0.01",
            inputMode: "decimal",
          })}

          {input("stock", "Stock (units)", {
            type: "number",
            min: 0,
            step: 1,
            inputMode: "numeric",
          })}

          <label className="adm-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={update}>
              <option value="published">Published (visible in the shop)</option>
              <option value="draft">Draft (hidden, not ready yet)</option>
            </select>
          </label>
        </div>

        {form.product_type === "fixed_price" && (
          <div className="adm-field adm-field--full adm-variants">
            <div className="adm-variants__header">
              <div>
                <strong>Product variants</strong>
                <small className="adm-form__hint">
                  Optional. Add different packages with their own prices and
                  stock.
                </small>
              </div>

              <button
                type="button"
                className="adm-btn adm-btn--outline"
                onClick={addVariant}
              >
                Add variant
              </button>
            </div>

            {variants.map((variant, index) => (
              <div className="adm-variant" key={variant.id ?? `new-${index}`}>
                <div className="adm-grid2">
                  <label className="adm-field">
                    <span>Variant name</span>
                    <input
                      value={variant.grade}
                      onChange={(e) =>
                        updateVariant(index, "grade", e.target.value)
                      }
                      placeholder="e.g. Small Box"
                      className={
                        errors[`variants.${index}.grade`] ? "has-error" : ""
                      }
                    />
                    {errors[`variants.${index}.grade`] && (
                      <small className="adm-field__error">
                        {errors[`variants.${index}.grade`]}
                      </small>
                    )}
                  </label>
                  <label className="adm-field">
                    <span>Exact weight (kg)</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={variant.weight_kg}
                      onChange={(e) =>
                        updateVariant(index, "weight_kg", e.target.value)
                      }
                      className={
                        errors[`variants.${index}.weight_kg`] ? "has-error" : ""
                      }
                    />
                    {errors[`variants.${index}.weight_kg`] && (
                      <small className="adm-field__error">
                        {errors[`variants.${index}.weight_kg`]}
                      </small>
                    )}
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
                    {errors[`variants.${index}.price`] && (
                      <small className="adm-field__error">
                        {errors[`variants.${index}.price`]}
                      </small>
                    )}
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
                    />
                  </label>

                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={variant.is_active}
                      onChange={(e) =>
                        updateVariant(index, "is_active", e.target.checked)
                      }
                    />
                    Available for purchase
                  </label>
                </div>

                <button
                  type="button"
                  className="adm-linkbtn"
                  onClick={() => removeVariant(index)}
                >
                  <FiX aria-hidden="true" /> Remove variant
                </button>
              </div>
            ))}

            {variants.length === 0 && (
              <small className="adm-form__hint">
                No variants added. The product's regular price and stock will be
                used.
              </small>
            )}

            {errors.variants && (
              <small className="adm-field__error">{errors.variants}</small>
            )}
          </div>
        )}

        <label className="adm-field">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={3}
            className={errors.description ? "has-error" : ""}
          />
          {errors.description && (
            <small className="adm-field__error">{errors.description}</small>
          )}
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
            {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
