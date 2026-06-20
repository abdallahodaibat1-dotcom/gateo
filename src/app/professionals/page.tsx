import { redirect } from 'next/navigation';

export default function ProfessionalsIndexRedirectPage() {
  // The professional directory has been merged into /businesses.
  redirect('/businesses');
}
