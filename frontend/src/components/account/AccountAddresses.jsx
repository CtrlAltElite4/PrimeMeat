import { useEffect, useRef, useState } from "react";
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
const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];
const normalizeProvince = (province) => {
  const value = province
    ?.toLowerCase()
    .replace(/\s+province$/i, "")
    .trim();

  const provinces = {
    "eastern cape": "Eastern Cape",
    "free state": "Free State",
    gauteng: "Gauteng",
    "kwazulu-natal": "KwaZulu-Natal",
    "kwazulu natal": "KwaZulu-Natal",
    limpopo: "Limpopo",
    mpumalanga: "Mpumalanga",
    "northern cape": "Northern Cape",
    "north west": "North West",
    "western cape": "Western Cape",
  };

  return provinces[value] || province || "";
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
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [activeAddressField, setActiveAddressField] = useState(null);
  const addressRequestRef = useRef(null);

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

  useEffect(() => {
    if (
      !import.meta.env.VITE_GEOAPIFY_API_KEY ||
      addressQuery.trim().length < 3
    ) {
      setAddressSuggestions([]);
      setAddressSearching(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setAddressSearching(true);

      try {
        const params = new URLSearchParams({
          text: addressQuery,
          filter: "countrycode:za",
          format: "json",
          limit: "5",
          apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
        });

        if (activeAddressField === "suburb") {
          params.set("type", "district");
        } else if (activeAddressField === "city") {
          params.set("type", "city");
        }

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Address search failed.");
        }

        const data = await response.json();
        setAddressSuggestions(data.results || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Address autocomplete failed:", error);
          setAddressSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAddressSearching(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [addressQuery, activeAddressField]);

  const selectAddressSuggestion = (place) => {
    setForm((previous) => ({
      ...previous,
      address_line_1:
        place.address_line1 ||
        [place.housenumber, place.street].filter(Boolean).join(" ") ||
        place.street ||
        previous.address_line_1,
      suburb: place.suburb || place.district || previous.suburb,
      city:
        place.city ||
        place.town ||
        place.village ||
        place.municipality ||
        previous.city,
      province: normalizeProvince(place.state) || previous.province,
      postal_code: place.postcode || previous.postal_code,
    }));

    setAddressQuery("");
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setValidationErrors({});
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
    setAddressQuery("");
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
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
    setAddressQuery(address.address_line_1 || "");
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
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
    setAddressQuery("");
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
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
  const renderAddressSuggestions = (field) => (
    <>
      {addressSearching && activeAddressField === field && (
        <span className="account-address-search-status">
          Searching addresses...
        </span>
      )}

      {showAddressSuggestions === field && addressSuggestions.length > 0 && (
        <div className="account-address-suggestions">
          {addressSuggestions.map((place) => (
            <button
              key={place.place_id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectAddressSuggestion(place)}
            >
              {place.formatted}
            </button>
          ))}
        </div>
      )}
    </>
  );
  const renderField = ({
    id,
    label,
    type = "text",
    required = false,
    placeholder = "",
    autoComplete,
  }) => {
    const validationError = getValidationError(id);
    const renderAddressSuggestions = (field) => (
      <>
        {addressSearching && (
          <span className="account-address-search-status">
            Searching addresses...
          </span>
        )}

        {showAddressSuggestions === field && addressSuggestions.length > 0 && (
          <div className="account-address-suggestions">
            {addressSuggestions.map((place) => (
              <button
                key={place.place_id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectAddressSuggestion(place)}
              >
                {place.formatted}
              </button>
            ))}
          </div>
        )}
      </>
    );
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

              <div
                className={`account-form-field account-address-field account-address-autocomplete ${
                  getValidationError("address_line_1")
                    ? "account-form-field--error"
                    : ""
                }`}
              >
                <label htmlFor="address-address_line_1">
                  Address Line 1<span className="account-required"> *</span>
                </label>

                <input
                  id="address-address_line_1"
                  name="address_line_1"
                  type="text"
                  value={form.address_line_1}
                  onChange={(event) => {
                    handleChange(event);
                    setAddressQuery(event.target.value);
                    setActiveAddressField("address_line_1");
                    setShowAddressSuggestions("address_line_1");
                  }}
                  onFocus={() => {
                    setAddressQuery(form.address_line_1);
                    setActiveAddressField("address_line_1");
                    setShowAddressSuggestions("address_line_1");
                  }}
                  autoComplete="off"
                  placeholder="Start typing your street address"
                  required
                  aria-invalid={Boolean(getValidationError("address_line_1"))}
                />

                {addressSearching && (
                  <span className="account-address-search-status">
                    Searching addresses...
                  </span>
                )}

                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="account-address-suggestions">
                    {addressSuggestions.map((place) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectAddressSuggestion(place)}
                      >
                        {place.formatted}
                      </button>
                    ))}
                  </div>
                )}

                {getValidationError("address_line_1") && (
                  <p className="account-field-error">
                    {getValidationError("address_line_1")}
                  </p>
                )}
              </div>

              {renderField({
                id: "address_line_2",
                label: "Address Line 2",
                autoComplete: "address-line2",
              })}

              <div className="account-form-field account-address-field account-address-autocomplete">
                <label htmlFor="address-suburb">Suburb</label>

                <input
                  id="address-suburb"
                  name="suburb"
                  value={form.suburb}
                  onChange={(event) => {
                    handleChange(event);
                    setAddressQuery(event.target.value);
                    setActiveAddressField("suburb");
                    setShowAddressSuggestions("suburb");
                  }}
                  onFocus={() => {
                    setAddressQuery(form.suburb);
                    setActiveAddressField("suburb");
                    setShowAddressSuggestions("suburb");
                  }}
                  autoComplete="off"
                />

                {renderAddressSuggestions("suburb")}
              </div>

              <div className="account-form-field account-address-field account-address-autocomplete">
                <label htmlFor="address-city">
                  City<span className="account-required"> *</span>
                </label>

                <input
                  id="address-city"
                  name="city"
                  value={form.city}
                  onChange={(event) => {
                    handleChange(event);
                    setAddressQuery(event.target.value);
                    setActiveAddressField("city");
                    setShowAddressSuggestions("city");
                  }}
                  onFocus={() => {
                    setAddressQuery(form.city);
                    setActiveAddressField("city");
                    setShowAddressSuggestions("city");
                  }}
                  autoComplete="off"
                  required
                />

                {renderAddressSuggestions("city")}
              </div>

              <div
                className={`account-form-field account-address-field ${
                  getValidationError("province")
                    ? "account-form-field--error"
                    : ""
                }`}
              >
                <label htmlFor="address-province">
                  Province<span className="account-required"> *</span>
                </label>

                <select
                  id="address-province"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(getValidationError("province"))}
                >
                  <option value="">Select Province</option>

                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>

                {getValidationError("province") && (
                  <p className="account-field-error">
                    {getValidationError("province")}
                  </p>
                )}
              </div>

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

          <button
            type="button"
            className="add-address-button"
            onClick={openAddForm}
          >
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
