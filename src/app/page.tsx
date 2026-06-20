import { auth } from '@/auth';
import LandingPage from '@/components/LandingPage';
import HomeFeed from '@/components/HomeFeed';

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    return <HomeFeed />;
  }

  return <LandingPage />;
}
