export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  nif: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: string;
  client_id: string;
  user_id: string;
  brand: string;
  model: string;
  license_plate: string;
  year: number;
  iuc_month: number;
  iuc_amount: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type IucPayment = {
  id: string;
  vehicle_id: string;
  user_id: string;
  year: number;
  amount: number;
  paid_at: string;
  notes: string | null;
  created_at: string;
};

export type IucStatus = "paid" | "pending" | "overdue" | "upcoming";

export type VehicleWithIucStatus = Vehicle & {
  client_name: string;
  client_nif: string;
  client_id: string;
  iuc_status: IucStatus;
};

export type ClientWithStats = Client & {
  vehicle_count: number;
  pending_iuc_count: number;
};
