export interface UserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  premium_until: string | null;
  organization?: string;
  purpose?: string;
}
