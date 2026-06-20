import { redirect } from 'next/navigation';

export default async function ProfessionalRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The professional directory has been merged into /businesses.
  // Individual profiles are now served at /business/[id].
  const { id } = await params;
  redirect(`/business/${id}`);
}
