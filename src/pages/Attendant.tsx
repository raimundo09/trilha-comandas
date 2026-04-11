import { useState, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Item, Comanda, Service } from '../types';
import { generateComandaCode, formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, Receipt, Printer, CheckCircle2, ShoppingBag, Sparkles, Search, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PrintLayout from '../components/PrintLayout';

export default function Attendant() {
  const [items, setItems] = useState<Item[]>([]);
  const [comandaNumber, setComandaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdComanda, setCreatedComanda] = useState<Comanda | null>(null);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal' | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [globalQuantity, setGlobalQuantity] = useState('1');

  useEffect(() => {
    const data = storage.getServices();
    setServices(data);
  }, []);

  const filteredServices = services.filter(s => {
    const search = serviceSearch.toLowerCase();
    const regex = /^(\d+)\s*[x\* ]\s*(.+)$/i;
    const match = search.match(regex);
    const term = match ? match[2].trim() : search;

    return s.name.toLowerCase().includes(term) || (s.code && s.code.toString().includes(term));
  });

  const addServiceToComanda = (service: Service, quantityOverride?: number) => {
    const qty = quantityOverride || parseInt(globalQuantity) || 1;
    const existingItem = items.find(i => i.name === service.name);
    if (existingItem) {
      setItems(items.map(i => 
        i.name === service.name ? { ...i, quantity: i.quantity + qty } : i
      ));
    } else {
      const newItem: Item = {
        id: crypto.randomUUID(),
        code: service.code,
        name: service.name,
        price: service.price,
        quantity: qty,
      };
      setItems([...items, newItem]);
    }
    // Reset global quantity after adding if it was changed
    if (globalQuantity !== '1') setGlobalQuantity('1');
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const search = serviceSearch.trim();
      if (!search) return;

      // Try parsing patterns like "10*7", "10x7", "10 7", "10 impressao"
      const regex = /^(\d+)\s*[x\* ]\s*(.+)$/i;
      const match = search.match(regex);
      
      let qty = parseInt(globalQuantity) || 1;
      let term = search;

      if (match) {
        qty = parseInt(match[1]);
        term = match[2].trim();
      }

      // 1. Try exact code match
      const byCode = services.find(s => s.code?.toString() === term);
      if (byCode) {
        addServiceToComanda(byCode, qty);
        setServiceSearch('');
        return;
      }

      // 2. Try filtering by name
      const matches = services.filter(s => 
        s.name.toLowerCase().includes(term.toLowerCase()) || 
        (s.code && s.code.toString() === term)
      );

      if (matches.length === 1) {
        addServiceToComanda(matches[0], qty);
        setServiceSearch('');
      }
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const createComanda = async () => {
    if (items.length === 0) return;
    const codeToUse = comandaNumber || generateComandaCode();

    const existing = storage.getOpenComandaByNumber(codeToUse);
    if (existing) {
      alert(`A comanda #${codeToUse} já está aberta. Por favor, use outro número ou finalize a anterior.`);
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const comandaData: Omit<Comanda, 'id'> = {
        code: codeToUse,
        items,
        total,
        status: 'Aberta',
        createdAt: now,
        updatedAt: now,
      };
      const newComanda = storage.addComanda(comandaData);
      setCreatedComanda(newComanda);
      setItems([]);
      setComandaNumber('');
    } catch (error) {
      console.error("Error creating comanda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (format: 'a4' | 'thermal') => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
      setPrintFormat(null);
    }, 100);
  };

  if (createdComanda) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="premium-card p-12 text-center space-y-8 border-slate-100">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-cyan-600 w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Comanda Confirmada</h2>
            <p className="text-slate-500 font-medium">O código digital já pode ser entregue ao cliente.</p>
          </div>
          
          <div className="bg-slate-50 p-10 rounded-[2.5rem] relative overflow-hidden group border border-slate-100">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-20 h-20 text-slate-900" />
            </div>
            <p className="text-xs font-black text-cyan-600 uppercase tracking-[0.3em] mb-4">Código de Acesso</p>
            <p className="text-6xl font-black text-slate-900 font-mono tracking-tighter">{createdComanda.code}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handlePrint('a4')}
              className="flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-lg shadow-cyan-900/20"
            >
              <Printer className="w-5 h-5 text-cyan-600" />
              Imprimir A4
            </button>
            <button
              onClick={() => handlePrint('thermal')}
              className="flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-lg shadow-cyan-900/20"
            >
              <Printer className="w-5 h-5 text-cyan-600" />
              Imprimir Bobina
            </button>
          </div>

          <button
            onClick={() => setCreatedComanda(null)}
            className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-900/40"
          >
            Nova Comanda
          </button>
        </div>

        {printFormat && (
          <div id="print-section">
            <PrintLayout comanda={createdComanda} format={printFormat} />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10"
    >
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Atendimento</h1>
        <p className="text-slate-500 mt-1 font-medium">Registre os materiais e gere o código do cliente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Item Form and Quick Services */}
        <div className="lg:col-span-3 space-y-6">
          {/* Services Search and List */}
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Catálogo de Serviços</h2>
              <Link to="/servicos" className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors">Gerenciar</Link>
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Ex: 10*7 ou 10 impressão..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all text-sm font-semibold"
                />
                {serviceSearch && (
                  <button 
                    onClick={() => setServiceSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="w-20 shrink-0">
                <input
                  type="number"
                  value={globalQuantity}
                  onChange={(e) => setGlobalQuantity(e.target.value)}
                  min="1"
                  placeholder="Qtd"
                  title="Quantidade para o próximo item"
                  className="w-full px-3 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all text-sm font-bold text-center"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-bold px-1 bg-slate-50 py-2 rounded-lg border border-slate-100">
              💡 Dica: Digite <span className="text-cyan-600">Qtd*Código</span> (ex: 5*18) e aperte Enter.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => addServiceToComanda(service)}
                  className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-[2rem] transition-all hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10 text-left h-40 overflow-hidden"
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-500">
                    <Package className="w-32 h-32 text-slate-900" />
                  </div>

                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      {service.code && (
                        <span className="px-4 py-2 bg-slate-900 text-white text-xl font-black rounded-2xl group-hover:bg-cyan-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-cyan-100">
                          #{service.code}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-cyan-900 transition-colors line-clamp-2">
                      {service.name}
                    </h3>
                  </div>

                  <div className="relative z-10 flex items-end justify-between mt-auto">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário</p>
                      <p className="text-xl font-black text-cyan-600">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white group-hover:bg-cyan-600 group-hover:scale-110 transition-all shadow-lg shadow-slate-200 group-hover:shadow-cyan-200">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </button>
              ))}
              {filteredServices.length === 0 && (
                <div className="text-center py-8 opacity-40">
                  <p className="text-xs font-bold text-slate-500">Nenhum serviço encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="lg:col-span-2">
          <div className="premium-card p-8 flex flex-col h-full min-h-[500px]">
            <h2 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-slate-600" />
              </div>
              Itens da Comanda
            </h2>

            <div className="flex-grow space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.code && (
                          <span className="text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded">#{item.code}</span>
                        )}
                        <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <p className="font-black text-slate-900 text-base">{formatCurrency(item.price * item.quantity)}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center gap-4 opacity-20">
                  <Receipt className="w-20 h-20 text-slate-900" />
                  <p className="font-black text-xl text-slate-900 uppercase tracking-widest">Lista Vazia</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Número da Comanda Física</label>
                <input
                  type="text"
                  value={comandaNumber}
                  onChange={(e) => setComandaNumber(e.target.value)}
                  placeholder="Opcional (Ex: 123)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-center text-lg"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em]">Total do Pedido</span>
                <span className="text-4xl font-black text-cyan-600">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={createComanda}
                disabled={items.length === 0 || loading}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-lg transition-all",
                  items.length > 0 && !loading 
                    ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-xl shadow-cyan-900/40" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                {loading ? "Processando..." : "Gerar Comanda Digital"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
