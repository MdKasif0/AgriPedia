import NotificationPreferences from '@/components/settings/NotificationPreferences'; // Adjust path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notification Settings - AgriPedia',
  description: 'Manage your notification preferences for AgriPedia.',
};

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <NotificationPreferences />
    </div>
  );
}
