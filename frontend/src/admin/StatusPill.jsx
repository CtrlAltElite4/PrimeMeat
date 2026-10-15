import { STATUS_LABELS } from './format';

export default function StatusPill({ status }) {
  return (
    <span className={`adm-pill adm-pill--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
