export interface Service {
  id: string;
  code?: number;
  name: string;
  price: number;
  category?: string;
}

export interface Item {
  id: string;
  code?: number;
  name: string;
  price: number;
  quantity: number;
}

export type ComandaStatus = 'Aberta' | 'Paga';

export interface Comanda {
  id: string;
  code: string;
  items: Item[];
  total: number;
  status: ComandaStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}
