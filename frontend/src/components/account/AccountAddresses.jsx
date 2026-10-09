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

  const getValidationError = (field) => {
    return validationErrors[field]?.[0];
  };

  if (loading) {
    return (
      <section className="account-section">
        <h1>Saved Addresses</h1>
        <p>Loading your saved addresses...</p>
      </section>
    );
  }

  return (
    <section className="account-section">
      <div className="account-section-header">
        <div>
          <h1>Saved Addresses</h1>
          <p>Manage your saved delivery addresses.</p>
        </div>

        {!showForm && (
          <button type="button" onClick={openAddForm}>
            Add Address
          </button>
        )}
      </div>

      {message && <p className="account-success-message">{message}</p>}

      {error && <p className="account-error-message">{error}</p>}

      {showForm && (
        <div className="account-address-form-section">
          <div className="account-address-form-header">
            <h2>{editingAddress ? "Edit Address" : "Add Address"}</h2>

            <button type="button" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
          </div>

          <form className="account-address-form" onSubmit={handleSubmit}>
            <div className="account-form-field">
              <label htmlFor="label">Address Label</label>

              <input
                id="label"
                name="label"
                type="text"
                value={form.label}
                onChange={handleChange}
                placeholder="e.g. Home or Work"
              />

              {getValidationError("label") && (
                <p>{getValidationError("label")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="recipient_name">Recipient Name</label>

              <input
                id="recipient_name"
                name="recipient_name"
                type="text"
                value={form.recipient_name}
                onChange={handleChange}
                required
              />

              {getValidationError("recipient_name") && (
                <p>{getValidationError("recipient_name")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+27 82 123 4567"
              />

              {getValidationError("phone") && (
                <p>{getValidationError("phone")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="address_line_1">Address Line 1</label>

              <input
                id="address_line_1"
                name="address_line_1"
                type="text"
                value={form.address_line_1}
                onChange={handleChange}
                required
              />

              {getValidationError("address_line_1") && (
                <p>{getValidationError("address_line_1")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="address_line_2">Address Line 2</label>

              <input
                id="address_line_2"
                name="address_line_2"
                type="text"
                value={form.address_line_2}
                onChange={handleChange}
              />

              {getValidationError("address_line_2") && (
                <p>{getValidationError("address_line_2")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="suburb">Suburb</label>

              <input
                id="suburb"
                name="suburb"
                type="text"
                value={form.suburb}
                onChange={handleChange}
              />

              {getValidationError("suburb") && (
                <p>{getValidationError("suburb")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="city">City</label>

              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                required
              />

              {getValidationError("city") && (
                <p>{getValidationError("city")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="province">Province</label>

              <input
                id="province"
                name="province"
                type="text"
                value={form.province}
                onChange={handleChange}
                required
              />

              {getValidationError("province") && (
                <p>{getValidationError("province")}</p>
              )}
            </div>

            <div className="account-form-field">
              <label htmlFor="postal_code">Postal Code</label>

              <input
                id="postal_code"
                name="postal_code"
                type="text"
                value={form.postal_code}
                onChange={handleChange}
                required
              />

              {getValidationError("postal_code") && (
                <p>{getValidationError("postal_code")}</p>
              )}
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

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingAddress
                  ? "Save Changes"
                  : "Save Address"}
            </button>
          </form>
        </div>
      )}

      {!showForm && addresses.length === 0 ? (
        <div className="account-empty-state">
          <p>You do not have any saved addresses yet.</p>

          <button type="button" onClick={openAddForm}>
            Add Your First Address
          </button>
        </div>
      ) : (
        !showForm && (
          <div className="account-address-list">
            {addresses.map((address) => (
              <article key={address.id} className="account-address-card">
                <div className="account-address-card-header">
                  <div>
                    <h2>{address.label || "Saved Address"}</h2>

                    {address.is_default && <span>Default</span>}
                  </div>
                </div>

                <div className="account-address-details">
                  <p>
                    <strong>{address.recipient_name}</strong>
                  </p>

                  <p>{address.phone}</p>

                  <p>{address.address_line_1}</p>

                  {address.address_line_2 && <p>{address.address_line_2}</p>}

                  {address.suburb && <p>{address.suburb}</p>}

                  <p>
                    {address.city}, {address.province}
                  </p>

                  <p>{address.postal_code}</p>
                </div>

                <div className="account-address-actions">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    disabled={actionLoading === address.id}
                  >
                    Edit
                  </button>

                  {!address.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={actionLoading === address.id}
                    >
                      {actionLoading === address.id
                        ? "Saving..."
                        : "Set as Default"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(address)}
                    disabled={actionLoading === address.id}
                  >
                    {actionLoading === address.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}

export default AccountAddresses;
