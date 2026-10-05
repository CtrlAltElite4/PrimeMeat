import "../styles/AddressForm.css";

function AddressForm({ address, onChange }) {
  const updateField = (field, value) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <div className="address-form">
      <div className="address-form-field address-form-field--full">
        <label htmlFor="address-line-1">Address Line 1</label>

        <input
          id="address-line-1"
          type="text"
          value={address.addressLine1}
          onChange={(event) => updateField("addressLine1", event.target.value)}
          placeholder="Street address"
          required
        />
      </div>

      <div className="address-form-field address-form-field--full">
        <label htmlFor="address-line-2">
          Address Line 2 <span>(Optional)</span>
        </label>

        <input
          id="address-line-2"
          type="text"
          value={address.addressLine2}
          onChange={(event) => updateField("addressLine2", event.target.value)}
          placeholder="Apartment, unit, complex, etc."
        />
      </div>

      <div className="address-form-field">
        <label htmlFor="address-city">City</label>

        <input
          id="address-city"
          type="text"
          value={address.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="City"
          required
        />
      </div>

      <div className="address-form-field">
        <label htmlFor="address-province">Province</label>

        <input
          id="address-province"
          type="text"
          value={address.province}
          onChange={(event) => updateField("province", event.target.value)}
          placeholder="Province"
          required
        />
      </div>

      <div className="address-form-field">
        <label htmlFor="address-postal-code">Postal Code</label>

        <input
          id="address-postal-code"
          type="text"
          value={address.postalCode}
          onChange={(event) => updateField("postalCode", event.target.value)}
          placeholder="Postal code"
          required
        />
      </div>

      <div className="address-form-field address-form-field--full">
        <label htmlFor="delivery-instructions">
          Delivery Instructions <span>(Optional)</span>
        </label>

        <textarea
          id="delivery-instructions"
          value={address.instructions}
          onChange={(event) => updateField("instructions", event.target.value)}
          placeholder="Any instructions for the delivery?"
          maxLength={2000}
        />
      </div>
    </div>
  );
}

export default AddressForm;
