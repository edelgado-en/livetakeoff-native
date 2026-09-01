import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { token, authIsBootstrapping } = useAuth();

  if (authIsBootstrapping) return null;

  return <Redirect href={token ? '/(tabs)/jobs' : '/login'} />;
}
