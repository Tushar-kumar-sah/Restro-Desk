'use client';

import PublicReviewPage from '../page';

export default function TableReviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { table?: string; bill?: string; outlet?: string };
}) {
  return <PublicReviewPage params={params} searchParams={searchParams} />;
}
