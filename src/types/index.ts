export interface OutletInfo {
  id: string;
  name: string;
  code: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  gstin?: string | null;
  fssaiNumber?: string | null;
  printerPaperWidth: string;
  taxIncludedInPrice: boolean;
  defaultGstPercent: number;
}

export interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  logoUrl?: string | null;
  currency: string;
  timezone: string;
}

export interface DateRangeFilter {
  label: 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'Custom';
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
