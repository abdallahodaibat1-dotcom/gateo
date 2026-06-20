import { redirect } from 'next/navigation';
import { use } from 'react';

export default function ProfessionalGroupRedirectPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  // Professional groups now live under /businesses/[categorySlug].
  const { group } = use(params);
  redirect(`/businesses/${encodeURIComponent(group)}`);
}
