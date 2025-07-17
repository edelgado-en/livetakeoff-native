import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { token } = useAuth();
  return <Redirect href={token ? '/jobs' : '/login'} />;
}