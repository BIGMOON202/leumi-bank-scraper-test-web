import { Outlet } from 'react-router-dom';
import { BankTopNav } from './BankTopNav';

export function DashboardLayout() {
  return (
    <div className="bank-app">
      <BankTopNav />
      <main className="bank-main">
        <Outlet />
      </main>
    </div>
  );
}
