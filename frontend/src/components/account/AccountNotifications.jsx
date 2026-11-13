
import { useState, useEffect } from 'react';

import {
  FiAlertTriangle,
  FiMail,
  //FiCreditCard,
  FiShoppingCart,
} from 'react-icons/fi';

import api from '../../api';
import '../../styles/account/Account.css';


// Default notification preferences
const Defaults = {
  orders: true,
  new_arrivals: true,
  special_deals: true,
  email_notifications: true,
};


// Normalize Laravel response to include only preference fields
const normalizePreferences = (data) => {
  const source = data.preferences ?? data;

  return Object.fromEntries(
    Object.keys(Defaults).map((key) => [
      key,
      source[key] ?? Defaults[key],
    ])
  );
};


// Notification groups
const Customer_Groups = [
  {
    title: 'Orders',
    items: [
      {
        key: 'orders',
        icon: FiShoppingCart,
        label: 'Orders',
        description: 'Receive notifications about your orders and their status',
      },
    ],
  },
  {
    title: 'Offers',
    items: [
      {
        key: 'new_arrivals',
        icon: FiAlertTriangle,
        label: 'New Arrivals',
        description: 'Be the first to know about new product arrivals',
      },
      /*
      {
        key: 'special_deals',
        icon: FiCreditCard,
        label: 'Special Deals',
        description: 'Get notified about exclusive deals and discounts',
      },
      */
    ],
  },
];


// Only these notification types can be emailed
const Customer_Email_Noti = ['orders', 'new_arrivals'];


// Reusable toggle component
export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`toggle${checked ? ' toggle-on' : ''}`}
      onClick={onChange}
    >
      <span className="toggle__knob" />
    </button>
  );
}


export default function NotificationSettings() {

  const [saved, setSaved] = useState(Defaults);
  const [draft, setDraft] = useState(Defaults);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  // Load existing customer preferences
  useEffect(() => {

    let cancelled = false;

    api.get('/api/notification-preferences')

      .then(({ data }) => {

        if (cancelled) return;

        const preferences = normalizePreferences(data);

        setSaved(preferences);
        setDraft(preferences);

      })

      .catch(() => {

        if (!cancelled) {
          setError('Unable to load your notification preferences.');
        }

      })

      .finally(() => {

        if (!cancelled) {
          setLoading(false);
        }

      });

    return () => {
      cancelled = true;
    };

  }, []);


  // Check whether preferences have changed
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);


  // Check whether at least one email-eligible notification is enabled
  const canEmail = Customer_Email_Noti.some(
    (key) => draft[key]
  );


  // Toggle a notification preference
  const flip = (key) => {

    setDraft((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setSuccess('');
    setError('');

  };


  // Save preferences to Laravel
  const handleSave = async () => {

    setSaving(true);
    setError('');
    setSuccess('');

    try {

      const { data } = await api.put(
        '/api/notification-preferences',
        draft
      );

      const preferences = normalizePreferences(data);

      setSaved(preferences);
      setDraft(preferences);

      setSuccess('Your notification preferences have been saved.');

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Unable to save your notification preferences.'
      );

    } finally {

      setSaving(false);

    }

  };


  // Discard unsaved changes
  const handleCancel = () => {

    setDraft(saved);
    setError('');
    setSuccess('');

  };


  if (loading) {
    return (
      <div className="account-notifications">
        Loading preferences...
      </div>
    );
  }


  return (

    <div className="account-notifications">

      <div className="account-section-header">
        <h1>Notifications</h1>
        <p>Manage your account notifications</p>
      </div>


      {/* Customer notification groups */}

      {Customer_Groups.map((group) => (

        <div
          key={group.title}
          className="account-notifications__group"
        >

          <h3 className="account-notifications__group-title">
            {group.title}
          </h3>

          <div className="account-notifications__items">

            {group.items.map((item) => (

              <div
                key={item.key}
                className="account-notifications__item"
              >

                <item.icon />

                <div className="account-notifications__text">

                  <span className="account-notifications__item-label">
                    {item.label}
                  </span>

                  <span className="account-notifications__item-description">
                    {item.description}
                  </span>

                </div>

                <Toggle
                  checked={draft[item.key]}
                  onChange={() => flip(item.key)}
                  label={item.label}
                />

              </div>

            ))}

          </div>

        </div>

      ))}


      <hr className="account-notifications__divider" />


      {/* Email notification preference */}

      <div className="account-notifications__item">

        <span className="account-notifications__icon">
          <FiMail />
        </span>

        <div className="account-notifications__text">

          <span className="account-notifications__item-label">
            Email notifications
          </span>

          <span className="account-notifications__item-description">
            You will be notified by email for the notifications you have enabled above.
          </span>

        </div>

        <Toggle
          checked={draft.email_notifications && canEmail}
          onChange={() => flip('email_notifications')}
          label="Also email me these"
          disabled={!canEmail}
        />

      </div>


      <p className="account-notifications__note">
        Registration, receipts, payment problems and password resets
        are always emailed.
      </p>


      {/* Feedback messages */}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {success && (
        <p role="status">
          {success}
        </p>
      )}


      {/* Save and cancel buttons */}

      <div className="account-notifications__actions">

        <button
          type="button"
          onClick={handleCancel}
          className="account-notifications__cancel"
          disabled={!dirty || saving}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="account-notifications__save"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>

      </div>

    </div>

  );

}
