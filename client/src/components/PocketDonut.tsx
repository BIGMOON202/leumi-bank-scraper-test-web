import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { AccountRow } from '../types';
import { donutTotal, pocketDonutData } from '../lib/donutData';

type Props = {
  accounts: AccountRow[];
};

export function PocketDonut({ accounts }: Props) {
  const data = useMemo(() => pocketDonutData(accounts), [accounts]);
  const total = useMemo(() => donutTotal(data), [data]);

  return (
    <div className="bank-donut-wrap">
      <div className="bank-donut-chart-box">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={84}
              paddingAngle={3}
              cornerRadius={8}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={5}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="bank-donut-center">
          <span className="bank-donut-center-pct">100%</span>
          <span className="bank-donut-center-sub">allocated</span>
        </div>
      </div>
      <div className="bank-donut-legend">
        {data.map((d) => (
          <div key={d.name} className="bank-legend-item">
            <div className="bank-legend-row">
              <span className="bank-legend-dot" style={{ background: d.color }} />
              <span className="bank-legend-name">{d.name}</span>
              <span className="bank-legend-pct">{total > 0 ? `${Math.round((d.value / total) * 100)}%` : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
