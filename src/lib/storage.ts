import { supabase } from './supabase';
import { Service, Comanda, Item } from '../types';

const DEFAULT_SERVICES: Omit<Service, 'id'>[] = [
  {"code": 3, "name": "Boletim de Ocorrência", "price": 50.00},
  {"code": 5, "name": "Cadastro Internet Geral", "price": 20.00},
  {"code": 8, "name": "Contrato de Compra e Venda", "price": 100.00},
  {"code": 9, "name": "Contrato de Locação", "price": 75.00},
  {"code": 14, "name": "Criação de Arte Simples", "price": 25.00},
  {"code": 15, "name": "Criação de Arte Elaborada", "price": 50.00},
  {"code": 18, "name": "Cópia Preto e Branco", "price": 0.75},
  {"code": 19, "name": "Kit 2 Fotos Polaroid Médias", "price": 9.90},
  {"code": 20, "name": "Kit 3 Fotos Polaroid Pequenas", "price": 9.90},
  {"code": 22, "name": "Currículo com Foto e 10 Cópias", "price": 15.00},
  {"code": 23, "name": "Currículos Simples 10 Cópias", "price": 10.00},
  {"code": 24, "name": "Currículo Simples 2 Cópias", "price": 8.00},
  {"code": 25, "name": "Digitação por Folha", "price": 10.00},
  {"code": 26, "name": "Digitalização Scanner por Folha", "price": 1.00},
  {"code": 30, "name": "Envio de Documento", "price": 3.00},
  {"code": 31, "name": "Kit 8 Fotos 3x4 ou 2x2", "price": 15.00},
  {"code": 32, "name": "Revelação de Foto 10x15", "price": 2.90},
  {"code": 34, "name": "Impressão Color P", "price": 1.50},
  {"code": 35, "name": "Impressão Color M", "price": 2.00},
  {"code": 36, "name": "Impressão Color G", "price": 3.00},
  {"code": 37, "name": "Impressão Preto e Branco", "price": 1.00},
  {"code": 40, "name": "Plastificação Tamanho RG/CNH", "price": 3.00},
  {"code": 41, "name": "Plastificação Meio A4", "price": 4.00},
  {"code": 42, "name": "Plastificação A4", "price": 6.00},
  {"code": 45, "name": "Serviço de Internet", "price": 7.00},
  {"code": 46, "name": "Serviços Diversos", "price": 1.00},
  {"code": 48, "name": "Encadernação 200 a 300 folhas", "price": 60.00},
  {"code": 49, "name": "Topper de Bolo", "price": 15.00},
  {"code": 52, "name": "Encadernação até 50 folhas", "price": 15.00},
  {"code": 53, "name": "Encadernação 50 a 100 folhas", "price": 20.00},
  {"code": 54, "name": "Impressão PB acima de 50 folhas", "price": 0.75},
  {"code": 55, "name": "Impressão PB acima de 100 folhas", "price": 0.50},
  {"code": 56, "name": "Serviço de Assistência", "price": 1.00},
  {"code": 57, "name": "Etiqueta personalizada por folha", "price": 15.00},
  {"code": 61, "name": "Encadernação 100 a 200 folhas", "price": 40.00},
  {"code": 1912, "name": "Papel Fotográfico 180g unitário", "price": 1.00},
  {"code": 2511, "name": "Papel Fotográfico Adesivo 135g", "price": 1.50},
  {"code": 75, "name": "Papel Canson", "price": 1.50},
  {"code": 3829, "name": "Assistência de Celular", "price": 10.00},
];

// Mapeia linha do banco para o tipo Comanda do frontend
function mapComanda(row: any): Comanda {
  return {
    id: row.id,
    code: row.code,
    total: Number(row.total),
    status: row.status,
    items: (row.comanda_items || []).map((item: any): Item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at || undefined,
  };
}

function mapService(row: any): Service {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    price: Number(row.price),
    category: row.category || undefined,
  };
}

export const storage = {
  // ==================== SERVICES ====================

  getServices: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('code', { ascending: true });
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
    return (data || []).map(mapService);
  },

  addService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        code: service.code,
        name: service.name,
        price: service.price,
        category: service.category,
      })
      .select()
      .single();
    if (error) throw error;
    return mapService(data);
  },

  updateService: async (id: string, updates: Partial<Service>): Promise<void> => {
    const dbUpdates: Record<string, any> = {};
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { error } = await supabase
      .from('services')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
  },

  deleteService: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  seedDefaultServices: async (): Promise<void> => {
    const existing = await storage.getServices();
    const toInsert = DEFAULT_SERVICES.filter(
      d => !existing.find(s => s.name === d.name)
    );
    if (toInsert.length > 0) {
      const rows = toInsert.map(s => ({
        code: s.code,
        name: s.name,
        price: s.price,
      }));
      const { error } = await supabase.from('services').insert(rows);
      if (error) throw error;
    }
  },

  // ==================== COMANDAS ====================

  getComandas: async (): Promise<Comanda[]> => {
    const { data, error } = await supabase
      .from('comandas')
      .select('*, comanda_items(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar comandas:', error);
      return [];
    }
    return (data || []).map(mapComanda);
  },

  addComanda: async (comanda: Omit<Comanda, 'id'>): Promise<Comanda> => {
    // 1. Inserir a comanda
    const { data: newComanda, error: comandaError } = await supabase
      .from('comandas')
      .insert({
        code: comanda.code,
        total: comanda.total,
        status: comanda.status,
        created_at: comanda.createdAt,
        updated_at: comanda.updatedAt,
      })
      .select()
      .single();
    if (comandaError) throw comandaError;

    // 2. Inserir os itens
    if (comanda.items.length > 0) {
      const items = comanda.items.map(item => ({
        comanda_id: newComanda.id,
        code: item.code,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const { error: itemsError } = await supabase
        .from('comanda_items')
        .insert(items);
      if (itemsError) throw itemsError;
    }

    // 3. Buscar comanda completa com itens
    const { data: fullComanda, error: fetchError } = await supabase
      .from('comandas')
      .select('*, comanda_items(*)')
      .eq('id', newComanda.id)
      .single();
    if (fetchError) throw fetchError;
    return mapComanda(fullComanda);
  },

  updateComanda: async (id: string, updates: Partial<Comanda>): Promise<void> => {
    // Atualizar campos da comanda
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
    if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('comandas')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
    }

    // Se itens foram atualizados, substituir todos
    if (updates.items) {
      // Deletar itens antigos
      await supabase
        .from('comanda_items')
        .delete()
        .eq('comanda_id', id);

      // Inserir novos itens
      if (updates.items.length > 0) {
        const items = updates.items.map(item => ({
          comanda_id: id,
          code: item.code,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));
        const { error: insertError } = await supabase
          .from('comanda_items')
          .insert(items);
        if (insertError) throw insertError;
      }
    }
  },

  getComandaByCode: async (code: string): Promise<Comanda | undefined> => {
    const { data, error } = await supabase
      .from('comandas')
      .select('*, comanda_items(*)')
      .ilike('code', code)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Erro ao buscar comanda por código:', error);
      return undefined;
    }
    return data ? mapComanda(data) : undefined;
  },

  getOpenComandaByNumber: async (number: string): Promise<Comanda | undefined> => {
    const { data, error } = await supabase
      .from('comandas')
      .select('*, comanda_items(*)')
      .eq('code', number)
      .eq('status', 'Aberta')
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Erro ao buscar comanda aberta:', error);
      return undefined;
    }
    return data ? mapComanda(data) : undefined;
  },

  deleteComanda: async (id: string): Promise<void> => {
    // comanda_items serão deletados automaticamente (ON DELETE CASCADE)
    const { error } = await supabase
      .from('comandas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  closeAllOpenComandas: async (): Promise<void> => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('comandas')
      .update({
        status: 'Paga',
        updated_at: now,
        paid_at: now,
      })
      .eq('status', 'Aberta');
    if (error) throw error;
  },
};
