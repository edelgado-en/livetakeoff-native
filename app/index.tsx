import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { token, loading } = useAuth();

  if (loading) return null; // or a splash screen

  return <Redirect href={token ? '/(tabs)/jobs' : '/login'} />;
}