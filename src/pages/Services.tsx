import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Service } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, Edit2, Search, Package, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCode, setEditCode] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const data = storage.getServices();
    setServices(data);
    setLoading(false);
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editPrice) return;
    
    try {
      storage.addService({
        name: editName,
        price: parseFloat(editPrice),
        code: editCode ? parseInt(editCode) : undefined,
      });
      setServices(storage.getServices());
      setEditName('');
      setEditPrice('');
      setEditCode('');
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleUpdateService = (id: string) => {
    if (!editName || !editPrice) return;
    try {
      storage.updateService(id, {
        name: editName,
        price: parseFloat(editPrice),
        code: editCode ? parseInt(editCode) : undefined,
      });
      setServices(storage.getServices());
      setIsEditing(null);
      setEditName('');
      setEditPrice('');
      setEditCode('');
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const handleDeleteService = (id: string) => {
    try {
      storage.deleteService(id);
      setServices(storage.getServices());
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const startEditing = (service: Service) => {
    setIsEditing(service.id);
    setEditName(service.name);
    setEditPrice(service.price.toString());
    setEditCode(service.code?.toString() || '');
  };

  const importDefaults = () => {
    const defaults = [
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
      {"code": 3829, "name": "Assistência de Celular", "price": 10.00}
    ];

    for (const item of defaults) {
      if (!services.find(s => s.name === item.name)) {
        storage.addService(item);
      }
    }
    setServices(storage.getServices());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Serviços e Produtos</h1>
          <p className="text-slate-500 mt-1 font-medium">Gerencie o catálogo de itens da Papelaria.</p>
        </div>
        <div className="flex gap-3">
          {services.length === 0 && (
            <button
              onClick={importDefaults}
              className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Cadastrar Lista de Serviços
            </button>
          )}
          <button
            onClick={() => {
              setEditName('');
              setEditPrice('');
              setEditCode('');
              setShowAddModal(true);
            }}
            className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100"
          >
            <Plus className="w-5 h-5" />
            Novo Serviço
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar serviço ou produto..."
          className="w-full pl-14 pr-5 py-5 rounded-[2rem] bg-white border-transparent focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all font-semibold shadow-sm premium-card"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service) => (
            <motion.div
              layout
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="premium-card p-6 group"
            >
              {isEditing === service.id ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="Código"
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateService(service.id)}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Salvar
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="px-4 bg-slate-100 text-slate-500 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(service)}
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                    {service.code && (
                      <span className="px-3 py-1 bg-slate-900 text-white text-sm font-black rounded-xl shrink-0">
                        #{service.code}
                      </span>
                    )}
                    <span className="line-clamp-2">{service.name}</span>
                  </h3>
                  <p className="text-2xl font-black text-cyan-600 mt-2">{formatCurrency(service.price)}</p>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredServices.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Package className="w-20 h-20 text-slate-900" />
              <p className="font-black text-xl text-slate-900 uppercase tracking-widest">Nenhum item encontrado</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">Novo Serviço</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddService} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Código</label>
                  <input
                    type="number"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="Ex: 101"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Nome do Serviço</label>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ex: Plastificação A3"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100"
                >
                  Adicionar ao Catálogo
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
