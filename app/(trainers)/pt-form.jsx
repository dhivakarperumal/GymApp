import { useRouter } from 'expo-router';
import PTForm from './PTForm/PTForm';

export default function TrainerPTForm() {
  const router = useRouter();
  return <PTForm router={router} />;
}

