import { useEffect, useState } from "react";
import "../styles/AddressForm.css";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

function AddressForm({ address, onChange }) {
  const [searchText, setSearchText] = useState(address.addressLine1 || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateField = (field, value) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  useEffect(() => {
    setSearchText(address.addressLine1 || "");
  }, [address.addressLine1]);

  useEffect(() => {
    if (!GEOAPIFY_API_KEY || searchText.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          text: searchText,
          filter: "countrycode:za",
          format: "json",
          apiKey: GEOAPIFY_API_KEY,
        });

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to retrieve address suggestions.");
        }

        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchText]);

  const selectAddress = (place) => {
    onChange({
      ...address,
      addressLine1:
        place.address_line1 || place.street || place.formatted || "",
      addressLine2: place.address_line2 || place.suburb || "",
      city:
        place.city || place.town || place.village || place.municipality || "",
      province: place.state || "",
      postalCode: place.postcode || "",
    });

    setSearchText(place.address_line1 || place.street || place.formatted || "");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="address-form">
      <div className="address-form-field address-form-field--full address-autocomplete">
        <label htmlFor="address-line-1">Address Line 1</label>

        <input
          id="address-line-1"
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            updateField("addressLine1", event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Start typing your street address"
          autoComplete="off"
          required
        />

        {loading && (
          <span className="address-autocomplete-status">
            Searching addresses...
          </span>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="address-suggestions" role="listbox">
            {suggestions.map((place) => (
              <button
                key={place.place_id}
                type="button"
                className="address-suggestion"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectAddress(place)}
              >
                {place.formatted}
              </button>
            ))}
          </div>
        )}
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

        <select
          id="address-province"
          value={address.province}
          onChange={(event) => updateField("province", event.target.value)}
          required
        >
          <option value="" disabled>
            Select province
          </option>
          <option value="Eastern Cape">Eastern Cape</option>
          <option value="Free State">Free State</option>
          <option value="Gauteng">Gauteng</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Mpumalanga">Mpumalanga</option>
          <option value="Northern Cape">Northern Cape</option>
          <option value="North West">North West</option>
          <option value="Western Cape">Western Cape</option>
        </select>
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
