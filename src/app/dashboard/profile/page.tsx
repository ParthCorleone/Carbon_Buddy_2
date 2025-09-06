import type { Metadata } from 'next';
import ProfilePage from './Profilepage';

export const metadata: Metadata = {
  title: 'Carbon Buddy - Profile',
};

export default function DashboardPage() {
  return <ProfilePage />;
}