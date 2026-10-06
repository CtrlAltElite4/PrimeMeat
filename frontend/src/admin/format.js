// Shared formatting for the admin pages

const twoDecimals = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/** 2560 -> "R2,560.00" */
export const formatRand = (n) => `R${Number(n).toLocaleString('en-US', twoDecimals)}`;

/** 12450.4 -> "R12,450" (for the stat card) */
export const formatRandShort = (n) => `R${Math.round(Number(n)).toLocaleString('en-US')}`;

/** 1402 -> "1,402" */
export const formatNumber = (n) => Number(n).toLocaleString('en-US');

/** "2026-09-26T10:00:00+02:00" -> "2026-09-26" */
export const formatDate = (value) => String(value).slice(0, 10);

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  ready_for_collection: 'Ready for collection',
  out_for_delivery: 'Out for delivery',
  collected: 'Collected',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
};

export const USER_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
};

export const USER_TYPE_LABELS = {
  admin: 'Admin',
  customer: 'Customer',
};

export const PRODUCT_STATUS_LABELS = {
  active: 'Active',
  low_stock: 'Low stock',
  unavailable: 'Unavailable',
  draft: 'Draft',
};

/** Every status label, used by StatusPill */
export const STATUS_LABELS = {
  ...PRODUCT_STATUS_LABELS, ...PAYMENT_STATUS_LABELS, ...ORDER_STATUS_LABELS, ...USER_STATUS_LABELS,
};

/** "Thabang Letsoalo" -> "TL" */
export const initials = (name) => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const FULFILLMENT_LABELS = {
  delivery: 'Delivery',
  collection: 'Collection',
};
