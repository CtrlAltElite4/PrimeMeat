import { useEffect, useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import api from '../api';
import { Modal } from './ui';

const GRADES = ['A', 'AB', 'B', 'BB', 'C'];
const MAX_IMAGE_MB = 2;

/** Add or edit a product. Pass `product` to edit, leave it out to add. */
export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    grade: product?.grade ?? '',
    category: product?.category ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? 0,
    status: product?.status ?? 'published',
    is_active: product?.is_active ?? true,
  });
  const [image, setImage] = useState(null);          // new file picked
  const [preview, setPreview] = useState(product?.image_url ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Free the temporary preview URL when it changes
  useEffect(() => () => { if (image && preview) URL.revokeObjectURL(preview); }, [image, preview]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((errs) => ({ ...errs, image: `Image must be ${MAX_IMAGE_MB} MB or smaller.` }));
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

    // FormData so the image file can be sent along with the fields
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v));
    if (image) body.append('image', image);
    if (removeImage) body.append('remove_image', '1');
    if (editing) body.append('_method', 'PUT');

    try {
      const url = editing ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const { data } = await api.post(url, body);
      onSaved(data, editing);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setErrors(fieldErrors
        ? Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]))
        : { form: 'Couldn\'t save the product. Try again.' });
      setSaving(false);
    }
  };

  const input = (name, label, props = {}) => (
    <label className="adm-field">
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={update} className={errors[name] ? 'has-error' : ''} {...props} />
      {errors[name] && <small className="adm-field__error">{errors[name]}</small>}
    </label>
  );

  return (
    <Modal title={editing ? `Edit ${product.code}` : 'Add product'} onClose={onClose} width={620}>
      <form className="adm-form" onSubmit={save} noValidate>
        <div className="adm-imgpick">
          <div className="adm-imgpick__box">
            {preview ? <img src={preview} alt="" /> : <FiImage aria-hidden="true" />}
          </div>
          <div className="adm-imgpick__actions">
            <label className="adm-btn adm-btn--outline adm-btn--file">
              {preview ? 'Change image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} />
            </label>
            {preview && (
              <button type="button" className="adm-linkbtn" onClick={clearImage}><FiX aria-hidden="true" /> Remove</button>
            )}
            <small className="adm-form__hint">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB</small>
            {errors.image && <small className="adm-field__error">{errors.image}</small>}
          </div>
        </div>

        <div className="adm-grid2">
          {input('name', 'Product name')}
          <label className="adm-field">
            <span>Grade</span>
            <input name="grade" value={form.grade} onChange={update} list="grade-options"
                   className={errors.grade ? 'has-error' : ''} placeholder="e.g. AB" />
            <datalist id="grade-options">{GRADES.map((g) => <option key={g} value={g} />)}</datalist>
            {errors.grade && <small className="adm-field__error">{errors.grade}</small>}
          </label>

          <label className="adm-field">
            <span>Category</span>
            <input name="category" value={form.category} onChange={update} list="category-options"
                   className={errors.category ? 'has-error' : ''} placeholder="Pick or type a new one" />
            <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            {errors.category && <small className="adm-field__error">{errors.category}</small>}
          </label>
          {input('price', 'Price (R)', { type: 'number', min: 0, step: '0.01', inputMode: 'decimal' })}

          {input('stock', 'Stock (units)', { type: 'number', min: 0, step: 1, inputMode: 'numeric' })}
          <label className="adm-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={update}>
              <option value="published">Published (visible in the shop)</option>
              <option value="draft">Draft (hidden, not ready yet)</option>
            </select>
          </label>
        </div>

        <label className="adm-field">
          <span>Description</span>
          <textarea name="description" value={form.description} onChange={update} rows={3}
                    className={errors.description ? 'has-error' : ''} />
          {errors.description && <small className="adm-field__error">{errors.description}</small>}
        </label>

        <label className="adm-check">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={update} />
          Available for purchase
        </label>

        {errors.form && <p className="adm-alert" role="alert">{errors.form}</p>}

        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
