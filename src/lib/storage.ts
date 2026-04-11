import { Service, Comanda } from '../types';

const SERVICES_KEY = 'papelaria_services';
const COMANDAS_KEY = 'papelaria_comandas';

export const storage = {
  // Services
  getServices: (): Service[] => {
    const data = localStorage.getItem(SERVICES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveServices: (services: Service[]) => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  },
  addService: (service: Omit<Service, 'id'>): Service => {
    const services = storage.getServices();
    const newService = { ...service, id: crypto.randomUUID() };
    storage.saveServices([...services, newService]);
    return newService;
  },
  updateService: (id: string, updates: Partial<Service>) => {
    const services = storage.getServices();
    const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
    storage.saveServices(updated);
  },
  deleteService: (id: string) => {
    const services = storage.getServices();
    storage.saveServices(services.filter(s => s.id !== id));
  },

  // Comandas
  getComandas: (): Comanda[] => {
    const data = localStorage.getItem(COMANDAS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveComandas: (comandas: Comanda[]) => {
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
  },
  addComanda: (comanda: Omit<Comanda, 'id'>): Comanda => {
    const comandas = storage.getComandas();
    const newComanda = { ...comanda, id: crypto.randomUUID() };
    storage.saveComandas([...comandas, newComanda]);
    return newComanda;
  },
  updateComanda: (id: string, updates: Partial<Comanda>) => {
    const comandas = storage.getComandas();
    const updated = comandas.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.saveComandas(updated);
  },
  getComandaByCode: (code: string): Comanda | undefined => {
    const comandas = storage.getComandas();
    return comandas.find(c => c.code.toUpperCase() === code.toUpperCase());
  },
  getOpenComandaByNumber: (number: string): Comanda | undefined => {
    const comandas = storage.getComandas();
    return comandas.find(c => c.code === number && c.status === 'Aberta');
  },
  deleteComanda: (id: string) => {
    const comandas = storage.getComandas();
    storage.saveComandas(comandas.filter(c => c.id !== id));
  }
};
