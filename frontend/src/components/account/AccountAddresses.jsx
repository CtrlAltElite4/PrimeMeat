import { useEffect, useState } from "react";
import api from "../../api";

const emptyForm = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  suburb: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

function AccountAddresses({ openAddAddress = false }) {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(openAddAddress);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/api/addresses");
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Failed to load addresses:", error);

      setError(
        error.response?.data?.message || "Unable to load your saved addresses.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");

    setValidationErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setForm(emptyForm);
    setValidationErrors({});
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingAddress(address);

    setForm({
      label: address.label || "",
      recipient_name: address.recipient_name || "",
      phone: address.phone || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      suburb: address.suburb || "",
      city: address.city || "",
      province: address.province || "",
      postal_code: address.postal_code || "",
      is_default: Boolean(address.is_default),
    });

    setValidationErrors({});
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingAddress(null);
    setForm(emptyForm);
    setValidationErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");
    setValidationErrors({});

    try {
      let response;

      if (editingAddress) {
        response = await api.put(`/api/addresses/${editingAddress.id}`, form);
      } else {
        response = await api.post("/api/addresses", form);
      }

      const savedAddress = response.data;

      if (editingAddress) {
        setAddresses((previous) =>
          previous.map((address) =>
            address.id === savedAddress.id
              ? savedAddress
              : form.is_default
                ? { ...address, is_default: false }
                : address,
          ),
        );

        setMessage("Your address has been updated successfully.");
      } else {
        setAddresses((previous) => {
          const updated = form.is_default
            ? previous.map((address) => ({
                ...address,
                is_default: false,
              }))
            : previous;

          return [...updated, savedAddress];
        });

        setMessage("Your address has been saved successfully.");
      }

      setShowForm(false);
      setEditingAddress(null);
      setForm(emptyForm);
    } catch (error) {
      console.error("Failed to save address:", error);

      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});

        setError(
          error.response.data.message ||
            "Please check the information you entered.",
        );
      } else {
        setError(
          error.response?.data?.message || "Unable to save your address.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setActionLoading(addressId);
      setMessage("");
      setError("");

      const { data } = await api.put(`/api/addresses/${addressId}/default`);

      setAddresses((previous) =>
        previous.map((address) => ({
          ...address,
          is_default: address.id === data.id,
        })),
      );

      setMessage("Your default address has been updated.");
    } catch (error) {
      console.error("Failed to set default address:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update your default address.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (address) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(address.id);
      setMessage("");
      setError("");

      await api.delete(`/api/addresses/${address.id}`);

      setAddresses((previous) =>
        previous.filter((item) => item.id !== address.id),
      );

      setMessage("The address has been deleted.");

      if (address.is_default) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to delete address:", error);

      setError(
        error.response?.data?.message || "Unable to delete the address.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getValidationError = (field) => validationErrors[field]?.[0];

  const renderField = ({
    id,
    label,
    type = "text",
    required = false,
    placeholder = "",
    autoComplete,
  }) => {
    const validationError = getValidationError(id);

    return (
      <div
        className={`account-form-field account-address-field ${
          validationError ? "account-form-field--error" : ""
        }`}
        key={id}
      >
        <label htmlFor={`address-${id}`}>
          {label}
          {required && <span className="account-required"> *</span>}
        </label>

        <input
          id={`address-${id}`}
          name={id}
          type={type}
          value={form[id]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? `address-${id}-error` : undefined}
        />

        {validationError && (
          <p className="account-field-error" id={`address-${id}-error`}>
            {validationError}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="account-section account-address-page">
        <div className="account-section-header">
          <div>
            <h1>Saved Addresses</h1>
            <p>Manage your saved delivery addresses.</p>
          </div>
        </div>

        <div
          className="account-content-box account-address-loading"
          role="status"
        >
          Loading your saved addresses...
        </div>
      </section>
    );
  }

  return (
    <section className="account-section account-address-page">
      <div className="account-section-header account-address-page-header">
        <div>
          <h1>Saved Addresses</h1>
          <p>Manage your saved delivery addresses.</p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="account-address-add-button"
            onClick={openAddForm}
          >
            Add Address
          </button>
        )}
      </div>

      {message && (
        <p className="account-success-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="account-error-message" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <div className="account-address-form-section">
          <div className="account-address-form-header">
            <div>
              <h2>{editingAddress ? "Edit Address" : "Add Address"}</h2>
              <p>Enter the details for this delivery address.</p>
            </div>

            <button
              type="button"
              className="account-address-cancel-button"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          <form className="account-address-form" onSubmit={handleSubmit}>
            <div className="account-address-form-grid">
              {renderField({
                id: "label",
                label: "Address Label",
                placeholder: "e.g. Home or Work",
                autoComplete: "off",
              })}

              {renderField({
                id: "recipient_name",
                label: "Recipient Name",
                required: true,
                autoComplete: "name",
              })}

              {renderField({
                id: "phone",
                label: "Phone Number",
                type: "tel",
                required: true,
                placeholder: "+27 82 123 4567",
                autoComplete: "tel",
              })}

              {renderField({
                id: "address_line_1",
                label: "Address Line 1",
                required: true,
                autoComplete: "address-line1",
              })}

              {renderField({
                id: "address_line_2",
                label: "Address Line 2",
                autoComplete: "address-line2",
              })}

              {renderField({
                id: "suburb",
                label: "Suburb",
                autoComplete: "address-level3",
              })}

              {renderField({
                id: "city",
                label: "City",
                required: true,
                autoComplete: "address-level2",
              })}

              {renderField({
                id: "province",
                label: "Province",
                required: true,
                autoComplete: "address-level1",
              })}

              {renderField({
                id: "postal_code",
                label: "Postal Code",
                required: true,
                autoComplete: "postal-code",
              })}
            </div>

            <label className="account-address-default-option">
              <input
                type="checkbox"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
              />

              <span>Set as my default address</span>
            </label>

            <div className="account-address-form-actions">
              <button
                type="submit"
                className="account-address-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingAddress
                    ? "Save Changes"
                    : "Save Address"}
              </button>

              <button
                type="button"
                className="account-address-form-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="account-empty-state account-address-empty">
          <h2>No Saved Addresses</h2>
          <p>Add an address to make your future delivery checkouts easier.</p>

          <button type="button" onClick={openAddForm}>
            Add Your First Address
          </button>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="account-address-list">
          {addresses.map((address) => {
            const isActionLoading = actionLoading === address.id;

            return (
              <article key={address.id} className="account-address-card">
                <div className="account-address-card-header">
                  <div className="account-address-title-group">
                    <h2>{address.label || "Saved Address"}</h2>

                    {address.is_default && (
                      <span className="account-address-default-badge">
                        Default Address
                      </span>
                    )}
                  </div>
                </div>

                <div className="account-address-details">
                  <p className="account-address-recipient">
                    {address.recipient_name}
                  </p>

                  <p className="account-address-phone">{address.phone}</p>

                  <div className="account-address-location">
                    <p>{address.address_line_1}</p>

                    {address.address_line_2 && <p>{address.address_line_2}</p>}

                    {address.suburb && <p>{address.suburb}</p>}

                    <p>
                      {[address.city, address.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {address.postal_code && <p>{address.postal_code}</p>}
                  </div>
                </div>

                <div className="account-address-actions">
                  <button
                    type="button"
                    className="account-address-edit-button"
                    onClick={() => openEditForm(address)}
                    disabled={isActionLoading}
                  >
                    Edit
                  </button>

                  {!address.is_default && (
                    <button
                      type="button"
                      className="account-address-default-button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? "Please wait..." : "Set as Default"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="account-address-delete-button"
                    onClick={() => handleDelete(address)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? "Please wait..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AccountAddresses;
