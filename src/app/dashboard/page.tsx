import type { Metadata } from 'next';
import DashboardClientPage from './DashboardClientpage';

export const metadata: Metadata = {
  title: 'Carbon Buddy - Dashboard',
};

export default function DashboardPage() {
  return <DashboardClientPage />;
}