import { formatCurrency, formatPercent } from "@/lib/transactions/format";
import type { MerchantSummary } from "@/types/transactions";

type TopMerchantsTableProps = {
  merchants: MerchantSummary[];
};

export function TopMerchantsTable({ merchants }: TopMerchantsTableProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Merchant concentration</p>
          <h2>Top merchants</h2>
        </div>
      </div>

      <table className="breakdown-table">
        <thead>
          <tr>
            <th>Merchant</th>
            <th>Spend</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.merchant}>
              <td>{merchant.merchant}</td>
              <td>{formatCurrency(merchant.totalSpend)}</td>
              <td className="share-cell">{formatPercent(merchant.shareOfSpend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
