import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/AuthProvider';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}