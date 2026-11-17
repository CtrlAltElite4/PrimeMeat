import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import api from "../api";
import "../styles/GroupOrderCheckout.css";

/**
 * Where PayFast sends the customer back to.
 *  - outcome="success":   /checkout/success?payment=PAY-1001
 *  - outcome="cancelled": /checkout/cancelled?payment=PAY-1001
 *
 * Coming back to the success page does NOT mean the payment went through. PayFast
 * confirms that separately (server to server), so this page checks with Laravel
 * a few times until the payment shows as completed.
 */
function CheckoutResult({ outcome, onCartUpdated }) {
  const [params] = useSearchParams();
  const paymentNumber = params.get("payment");

  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [gaveUp, setGaveUp] = useState(false);

  // Kept in a ref so a new function from App doesn't restart the checks
  const refreshCart = useRef(onCartUpdated);
  useEffect(() => { refreshCart.current = onCartUpdated; }, [onCartUpdated]);

  useEffect(() => {
    if (!paymentNumber) {
      setError("No payment reference was found.");
      return undefined;
    }

    let stopped = false;
    let attempts = 0;
    let timer;

    const check = async () => {
      try {
        const { data } =
          outcome === "cancelled" && attempts === 0
            ? await api.post(`/api/checkout/payments/${paymentNumber}/cancel`)
            : await api.get(`/api/checkout/payments/${paymentNumber}`);

        if (stopped) return;
        setPayment(data);

        if (data.status === "completed") {
          refreshCart.current?.();
          return;
        }

        attempts += 1;
        if (outcome === "success" && data.status === "pending") {
          if (attempts < 10) timer = setTimeout(check, 3000);
          else setGaveUp(true);
        }
      } catch (requestError) {
        if (!stopped) {
          setError(
            requestError.response?.data?.message ||
              "We couldn't load your payment details.",
          );
        }
      }
    };

    check();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [paymentNumber, outcome]);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Group orders go back to their own checkout page instead of the cart
  const isGroup = Boolean(payment?.group_order_id);

  let title = "Checking your payment…";
  let message = "This usually takes a few seconds.";

  if (error) {
    title = "Something went wrong";
    message = error;
  } else if (payment?.status === "completed") {
    title = "Thank you for your order!";
    message = `Your payment of R${formatPrice(payment.amount)} was received. Order ${payment.order_number} is now being prepared.`;
    if (isGroup) {
      message += " Every group member is being emailed a confirmation.";
    }
  } else if (payment?.status === "failed" || outcome === "cancelled") {
    title = "Payment cancelled";
    message = isGroup
      ? "You weren't charged. Your group order has been saved, so you can try again whenever you're ready."
      : "You weren't charged. Your cart has been kept, so you can try again whenever you're ready.";
  } else if (gaveUp) {
    title = "We're still waiting for PayFast";
    message = `Your payment hasn't been confirmed yet. If you paid, it will update shortly. Keep your reference: ${paymentNumber}.`;
  }

  return (
    <main className="group-order-checkout-page">
      <section className="group-order-checkout-header">
        <span>CHECKOUT</span>
        <h1>{title}</h1>
        <p>{message}</p>
        {payment && (
          <p>
            Payment reference: <strong>{payment.payment_number}</strong>
          </p>
        )}
      </section>

      <div className="group-order-checkout-summary">
        {payment?.status === "completed" ? (
          <Link to="/account" className="group-order-checkout-payment">
            View my orders
          </Link>
        ) : isGroup ? (
          <Link
            to={`/group-orders/checkout/${payment.group_order_id}`}
            className="group-order-checkout-payment"
          >
            Back to group order
          </Link>
        ) : (
          <Link to="/cart" className="group-order-checkout-payment">
            Back to cart
          </Link>
        )}

        <Link to="/products" className="group-order-checkout-return">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}

export default CheckoutResult;
