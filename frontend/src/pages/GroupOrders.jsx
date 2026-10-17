import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import AddressForm from "../components/AddressForm";
import "../styles/GroupOrders.css";

const WEIGHT_RANGES = [
  {
    id: "200-240",
    label: "200–240 kg",
    price: 17000,
  },
  {
    id: "241-280",
    label: "241–280 kg",
    price: 20750,
  },
  {
    id: "281-320",
    label: "281–320 kg",
    price: 23750,
  },
];

function GroupOrders() {
  const navigate = useNavigate();

  const [selectedWeightRange, setSelectedWeightRange] = useState("");
  const [includeGroundBeef, setIncludeGroundBeef] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);

  const [members, setMembers] = useState([
    {
      name: "",
      email: "",
      phone: "",
    },
    {
      name: "",
      email: "",
      phone: "",
    },
  ]);

  const [deliveryMemberIndex, setDeliveryMemberIndex] = useState(0);

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");

  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const { data } = await api.get("/api/addresses");

        const addresses = data.addresses || [];

        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.is_default);

        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));

          setDeliveryAddress((current) => ({
            ...current,
            addressLine1: defaultAddress.address_line_1 || "",
            addressLine2: defaultAddress.address_line_2 || "",
            city: defaultAddress.city || "",
            province: defaultAddress.province || "",
            postalCode: defaultAddress.postal_code || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load saved addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  const selectedRange = WEIGHT_RANGES.find(
    (range) => range.id === selectedWeightRange,
  );

  const pricePerPerson = selectedRange
    ? selectedRange.price / numberOfPeople
    : 0;

  const updateMember = (index, field, value) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const updateNumberOfPeople = (value) => {
    const number = Math.min(8, Math.max(2, Number(value)));

    setNumberOfPeople(number);

    setMembers((current) => {
      if (number > current.length) {
        return [
          ...current,
          ...Array.from({ length: number - current.length }, () => ({
            name: "",
            email: "",
            phone: "",
          })),
        ];
      }

      return current.slice(0, number);
    });

    if (deliveryMemberIndex >= number) {
      setDeliveryMemberIndex(0);
    }
  };
  const handleSavedAddressChange = (event) => {
    const addressId = event.target.value;

    setSelectedAddressId(addressId);

    if (!addressId) {
      setDeliveryAddress((current) => ({
        ...current,
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        postalCode: "",
      }));

      return;
    }

    const selectedAddress = savedAddresses.find(
      (address) => String(address.id) === addressId,
    );

    if (!selectedAddress) {
      return;
    }

    setDeliveryAddress((current) => ({
      ...current,
      addressLine1: selectedAddress.address_line_1 || "",
      addressLine2: selectedAddress.address_line_2 || "",
      city: selectedAddress.city || "",
      province: selectedAddress.province || "",
      postalCode: selectedAddress.postal_code || "",
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedWeightRange) {
      setError("Please select a weight range.");
      return;
    }

    if (numberOfPeople < 2 || numberOfPeople > 8) {
      setError("A group order must have between 2 and 8 people.");
      return;
    }

    if (members.length !== numberOfPeople) {
      setError("Please make sure all group members are included.");
      return;
    }

    if (deliveryMethod === "delivery") {
      if (
        !deliveryAddress.addressLine1 ||
        !deliveryAddress.city ||
        !deliveryAddress.province ||
        !deliveryAddress.postalCode
      ) {
        setError("Please complete the delivery address.");
        return;
      }
    }

    try {
      const { data } = await api.post("/api/group-orders/checkout", {
        weight_range: selectedWeightRange,
        include_ground_beef: includeGroundBeef,
        number_of_people: numberOfPeople,
        members,
        delivery_member_index: deliveryMemberIndex,
        delivery_method: deliveryMethod,

        address_line_1:
          deliveryMethod === "delivery" ? deliveryAddress.addressLine1 : null,

        address_line_2:
          deliveryMethod === "delivery" ? deliveryAddress.addressLine2 : null,

        city: deliveryMethod === "delivery" ? deliveryAddress.city : null,

        province:
          deliveryMethod === "delivery" ? deliveryAddress.province : null,

        postal_code:
          deliveryMethod === "delivery" ? deliveryAddress.postalCode : null,

        delivery_instructions:
          deliveryMethod === "delivery" ? deliveryAddress.instructions : null,
      });

      navigate(`/group-orders/checkout/${data.group_order.id}`);
    } catch (requestError) {
      if (requestError.response?.data?.errors) {
        const validationErrors = requestError.response.data.errors;

        const firstError = Object.values(validationErrors).flat().at(0);

        setError(firstError || "Please check the form.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to proceed to checkout.",
        );
      }
    }
  };

  return (
    <main className="group-orders-page">
      <section className="group-orders-hero">
        <div className="group-orders-hero-content">
          <span className="group-orders-label">GROUP ORDERS</span>

          <h1>Share a full carcass with your group.</h1>

          <p>
            Order a full carcass together and have the traditional cuts divided
            as evenly as possible among your group members.
          </p>
        </div>
      </section>

      <form className="group-orders-form" onSubmit={handleSubmit}>
        <section className="group-orders-section">
          <div className="group-orders-section-heading">
            <span>01</span>

            <div>
              <h2>Choose your weight range</h2>

              <p>Select the expected full carcass weight.</p>
            </div>
          </div>

          <div className="group-orders-weight-options">
            {WEIGHT_RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                className={`group-orders-weight-option ${
                  selectedWeightRange === range.id
                    ? "group-orders-weight-option--selected"
                    : ""
                }`}
                onClick={() => setSelectedWeightRange(range.id)}
              >
                <strong>{range.label}</strong>
                <span>R{range.price.toLocaleString("en-ZA")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="group-orders-section">
          <div className="group-orders-section-heading">
            <span>02</span>

            <div>
              <h2>Group members</h2>

              <p>Add everyone who will share the carcass. Maximum 8 people.</p>
            </div>
          </div>

          <div className="group-orders-people">
            <label htmlFor="group-number-of-people">Number of people</label>

            <input
              id="group-number-of-people"
              type="number"
              min="2"
              max="8"
              value={numberOfPeople}
              onChange={(event) => updateNumberOfPeople(event.target.value)}
            />
          </div>

          <div className="group-orders-members">
            {members.map((member, index) => (
              <div className="group-orders-member" key={index}>
                <div className="group-orders-member-heading">
                  <h3>Person {index + 1}</h3>

                  <label>
                    <input
                      type="radio"
                      name="delivery-member"
                      checked={deliveryMemberIndex === index}
                      onChange={() => setDeliveryMemberIndex(index)}
                    />
                    Delivery recipient
                  </label>
                </div>

                <div className="group-orders-member-fields">
                  <label>
                    Full Name
                    <input
                      type="text"
                      value={member.name}
                      onChange={(event) =>
                        updateMember(index, "name", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={member.email}
                      onChange={(event) =>
                        updateMember(index, "email", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(event) =>
                        updateMember(index, "phone", event.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="group-orders-section">
          <div className="group-orders-section-heading">
            <span>03</span>

            <div>
              <h2>Ground Beef</h2>

              <p>Would you like to include ground beef in your order?</p>
            </div>
          </div>

          <div className="group-orders-ground-beef-options">
            <button
              type="button"
              className={`group-orders-ground-beef-option ${
                includeGroundBeef
                  ? "group-orders-ground-beef-option--selected"
                  : ""
              }`}
              onClick={() => setIncludeGroundBeef(true)}
            >
              <strong>Yes</strong>
              <span>Include ground beef.</span>
            </button>

            <button
              type="button"
              className={`group-orders-ground-beef-option ${
                !includeGroundBeef
                  ? "group-orders-ground-beef-option--selected"
                  : ""
              }`}
              onClick={() => setIncludeGroundBeef(false)}
            >
              <strong>No</strong>
              <span>Do not include ground beef.</span>
            </button>
          </div>
        </section>

        <section className="group-orders-section">
          <div className="group-orders-section-heading">
            <span>04</span>

            <div>
              <h2>How would you like to receive your order?</h2>

              <p>Choose delivery to one group member or collection.</p>
            </div>
          </div>

          <div className="group-orders-delivery-options">
            <button
              type="button"
              className={`group-orders-delivery-option ${
                deliveryMethod === "delivery"
                  ? "group-orders-delivery-option--selected"
                  : ""
              }`}
              onClick={() => setDeliveryMethod("delivery")}
            >
              <strong>Delivery</strong>
              <span>Have the group order delivered to one member.</span>
            </button>

            <button
              type="button"
              className={`group-orders-delivery-option ${
                deliveryMethod === "collection"
                  ? "group-orders-delivery-option--selected"
                  : ""
              }`}
              onClick={() => setDeliveryMethod("collection")}
            >
              <strong>Collection</strong>
              <span>Collect the group order from our location.</span>
            </button>
          </div>

          {deliveryMethod === "delivery" && (
            <>
              <div className="group-orders-recipient">
                <span>Delivery recipient</span>

                <strong>
                  {members[deliveryMemberIndex]?.name ||
                    `Person ${deliveryMemberIndex + 1}`}
                </strong>
              </div>

              {!loadingAddresses && savedAddresses.length > 0 && (
                <div className="group-orders-saved-address">
                  <label htmlFor="group-saved-address">Saved Address</label>

                  <select
                    id="group-saved-address"
                    value={selectedAddressId}
                    onChange={handleSavedAddressChange}
                  >
                    <option value="">Enter a different address</option>

                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label || "Saved Address"}
                        {address.is_default ? " — Default" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <AddressForm
                address={deliveryAddress}
                onChange={setDeliveryAddress}
              />
            </>
          )}
        </section>

        <section className="group-orders-section group-orders-review">
          <div className="group-orders-section-heading">
            <span>05</span>

            <div>
              <h2>Review your group order</h2>

              <p>
                Traditional cuts will be divided as evenly as possible among the
                group members.
              </p>
            </div>
          </div>

          <div className="group-orders-review-content">
            <div>
              <span>Carcass</span>
              <strong>Full Carcass</strong>
            </div>

            <div>
              <span>Weight range</span>

              <strong>{selectedRange?.label || "Not selected"}</strong>
            </div>

            <div className="group-orders-review-people">
              <span>Group size</span>
              <strong>{numberOfPeople} people</strong>

              {selectedRange && (
                <small className="group-orders-review-per-person">
                  R
                  {pricePerPerson.toLocaleString("en-ZA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  per person
                </small>
              )}
            </div>

            <div>
              <span>Ground beef</span>

              <strong>{includeGroundBeef ? "Yes" : "No"}</strong>
            </div>

            <div>
              <span>Collection / Delivery</span>

              <strong>
                {deliveryMethod === "delivery" ? "Delivery" : "Collection"}
              </strong>
            </div>

            {deliveryMethod === "delivery" && (
              <div>
                <span>Delivery recipient</span>

                <strong>
                  {members[deliveryMemberIndex]?.name ||
                    `Person ${deliveryMemberIndex + 1}`}
                </strong>
              </div>
            )}

            <div>
              <span>Order total</span>

              <strong>
                {selectedRange
                  ? `R${selectedRange.price.toLocaleString("en-ZA")}`
                  : "Not selected"}
              </strong>
            </div>
          </div>

          {error && <p className="group-orders-error">{error}</p>}

          <button type="submit" className="group-orders-submit">
            Proceed to Checkout
          </button>
        </section>
      </form>
    </main>
  );
}

export default GroupOrders;
