export interface Organization {
  id: string;
  name: string;
  acronym: string | null;
  created_at: string;
  updated_at: string;
}

export interface Office {
  id: string;
  organization_id: string;
  name: string;
  acronym: string | null;
  parent_office_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  office_id: string | null;
  full_name: string | null;
  username: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  barcode: string | null;
}

export interface Item {
  id: string;
  barcode: string;
  item_name: string;
  category_id: string | null;
  quantity: number;
  description: string | null;
  identification: string | null;
  shortname: string | null;
  created_at: string;
}
