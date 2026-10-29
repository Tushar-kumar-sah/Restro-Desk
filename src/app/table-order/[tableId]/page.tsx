'use client';

import TableOrderPage from '../page';

export default function TableOrderWithIdPage({
  params,
  searchParams,
}: {
  params: { tableId: string };
  searchParams?: { table?: string; outlet?: string };
}) {
  return <TableOrderPage params={params} searchParams={searchParams} />;
}
