import type { Metadata } from 'next';
import AuthPage from './Authpage';

export const metadata: Metadata = {
  title: 'Carbon Buddy',
};

export default function DashboardPage() {
  return <AuthPage />;
}