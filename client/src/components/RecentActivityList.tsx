import { formatMoney } from '../lib/format';
import type { TxnRow } from '../types';

type Item = { accountNumber: string; txn: TxnRow };

const gradients = ['grad-a', 'grad-b', 'grad-c', 'grad-d', 'grad-e'];

function initialFor(desc: string): string {
  const t = desc.trim();
  return t ? t[0].toUpperCase() : '?';
}

function gradClass(desc: string): string {
  let h = 0;
  for (let i = 0; i < desc.length; i++) {
    h = (h + desc.charCodeAt(i) * (i + 1)) % gradients.length;
  }
  return gradients[h];
}

export function RecentActivityList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="activity-empty">No recent items.</p>;
  }

  return (
    <ul className="activity-list">
      {items.map(({ txn, accountNumber }, i) => {
        const inst =
          txn.installments != null ? ` · ${txn.installments.number}/${txn.installments.total}` : '';
        return (
          <li key={`${accountNumber}-${txn.date}-${i}`} className="activity-item">
            <div className={`activity-avatar ${gradClass(txn.description)}`} aria-hidden>
              {initialFor(txn.description)}
            </div>
            <div className="activity-body">
              <div className="activity-title">
                {txn.description}
                {inst}
              </div>
              <div className="activity-meta">
                {txn.date.slice(0, 10)} · <span className="mono">{accountNumber}</span>
              </div>
            </div>
            <div className={`activity-amount ${txn.chargedAmount < 0 ? 'neg' : 'pos'}`}>
              {formatMoney(txn.chargedAmount, txn.originalCurrency)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
