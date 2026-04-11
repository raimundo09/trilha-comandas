import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Comanda, Service } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Receipt, CheckCircle2, Printer, AlertCircle, Wallet, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PrintLayout from '../components/PrintLayout';

export default function Cashier() {
  const [searchCode, setSearchCode] = useState('');
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openComandas, setOpenComandas] = useState<Comanda[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const data = storage.getComandas().filter(c => c.status === 'Aberta');
    setOpenComandas(data);
    setServices(storage.getServices());
  }, []);

  const searchComanda = async (e?: { preventDefault: () => void }) => {
    if (e) e.preventDefault();
    if (!searchCode) return;
    
    setLoading(true);
    setError('');
    try {
      // 1. Check if it's a product code
      const product = services.find(s => s.code?.toString() === searchCode);
      
      if (product) {
        if (comanda && comanda.status === 'Aberta') {
          const existingItem = comanda.items.find(i => i.name === product.name);
          let updatedItems;
          if (existingItem) {
            updatedItems = comanda.items.map(i => 
              i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            updatedItems = [...comanda.items, {
              id: crypto.randomUUID(),
              code: product.code,
              name: product.name,
              price: product.price,
              quantity: 1
            }];
          }
          const updatedTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
          const updates = { items: updatedItems, total: updatedTotal, updatedAt: new Date().toISOString() };
          storage.updateComanda(comanda.id, updates);
          setComanda({ ...comanda, ...updates });
          setSearchCode('');
          return;
        } else {
          setError('Carregue uma comanda aberta para adicionar produtos.');
          setSearchCode('');
          return;
        }
      }

      // 2. Search for comanda
      const found = storage.getOpenComandaByNumber(searchCode) || storage.getComandaByCode(searchCode);
      
      if (!found) {
        setError('Comanda ou produto não encontrado.');
        setComanda(null);
      } else {
        setComanda(found);
        setShowDeleteConfirm(false);
      }
      setSearchCode('');
    } catch (err) {
      console.error("Error searching:", err);
      setError('Erro ao buscar.');
    } finally {
      setLoading(false);
    }
  };

  const reopenComanda = () => {
    if (!comanda || comanda.status === 'Aberta') return;
    
    const existingOpen = storage.getOpenComandaByNumber(comanda.code);
    if (existingOpen) {
      setError(`Não é possível reabrir. Já existe uma comanda #${comanda.code} aberta.`);
      return;
    }

    try {
      storage.updateComanda(comanda.id, { status: 'Aberta', updatedAt: new Date().toISOString() });
      setComanda({ ...comanda, status: 'Aberta' });
      setOpenComandas(storage.getComandas().filter(c => c.status === 'Aberta'));
    } catch (err) {
      console.error("Error reopening comanda:", err);
    }
  };

  const finalizePayment = async () => {
    if (!comanda) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      storage.updateComanda(comanda.id, {
        status: 'Paga',
        updatedAt: now,
        paidAt: now,
      });
      const updatedComanda = { ...comanda, status: 'Paga' as const, paidAt: now };
      setComanda(updatedComanda);
      
      // Update open comandas list
      const data = storage.getComandas().filter(c => c.status === 'Aberta');
      setOpenComandas(data);
    } catch (err) {
      console.error("Error finalizing payment:", err);
      setError('Erro ao finalizar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComanda = () => {
    if (!comanda) return;
    try {
      storage.deleteComanda(comanda.id);
      setComanda(null);
      setShowDeleteConfirm(false);
      // Update open comandas list
      const data = storage.getComandas().filter(c => c.status === 'Aberta');
      setOpenComandas(data);
    } catch (err) {
      console.error("Error deleting comanda:", err);
      setError('Erro ao excluir comanda.');
    }
  };

  const handlePrint = (format: 'a4' | 'thermal') => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
      setPrintFormat(null);
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Caixa</h1>
        <p className="text-slate-500 mt-1 font-medium">Processamento de pagamentos e fechamento de contas da Papelaria.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search and List */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={searchComanda} className="premium-card p-8 space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-cyan-600" />
              </div>
              Buscar
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="ESCANEIE OU DIGITE"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono font-black text-xl uppercase tracking-widest text-center"
              />
              <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
                Pronto para bipar o código de barras
              </p>
              <button
                type="submit"
                disabled={loading || !searchCode}
                className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100"
              >
                {loading ? "Buscando..." : "Localizar Comanda"}
              </button>
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-sm font-bold flex items-center gap-2 bg-red-50 p-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.p>
            )}
          </form>

          <div className="premium-card p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-amber-600" />
              </div>
              Abertas
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {openComandas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchCode(c.code);
                    setComanda(c);
                    setError('');
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-cyan-50 rounded-2xl transition-all border border-transparent hover:border-cyan-100 group"
                >
                  <span className="font-mono font-black text-slate-900 group-hover:text-cyan-600 transition-colors">{c.code}</span>
                  <span className="font-black text-slate-900">{formatCurrency(c.total)}</span>
                </button>
              ))}
              {openComandas.length === 0 && (
                <div className="text-center py-10 opacity-20">
                  <Receipt className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold text-sm">Nenhuma pendência</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details and Payment */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {comanda ? (
              <motion.div 
                key={comanda.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="premium-card overflow-hidden h-full flex flex-col"
              >
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-900 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl shadow-sm flex items-center justify-center">
                      <Receipt className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Comanda Digital</h2>
                      <p className="text-sm font-mono text-cyan-400 font-black tracking-widest uppercase">{comanda.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      {showDeleteConfirm ? (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-2"
                        >
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleDeleteComanda}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Confirmar Exclusão
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-3"
                        >
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-white/50"
                            title="Excluir Comanda"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <span className={cn(
                            "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                            comanda.status === 'Aberta' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                          )}>
                            {comanda.status}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-8 flex-grow space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Itens Consumidos</h3>
                    <div className="space-y-3">
                      {comanda.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl">
                          <div>
                            <div className="flex items-center gap-2">
                              {item.code && (
                                <span className="text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded">#{item.code}</span>
                              )}
                              <p className="font-bold text-slate-900">{item.name}</p>
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.quantity}x {formatCurrency(item.price)}</p>
                          </div>
                          <p className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-black uppercase tracking-[0.2em]">Total a Pagar</span>
                      <span className="text-5xl font-black text-cyan-600 tracking-tighter">{formatCurrency(comanda.total)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handlePrint('a4')}
                        className="flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        <Printer className="w-5 h-5 text-cyan-400" />
                        Imprimir A4
                      </button>
                      <button
                        onClick={() => handlePrint('thermal')}
                        className="flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        <Printer className="w-5 h-5 text-cyan-400" />
                        Imprimir Bobina
                      </button>
                    </div>

                    {comanda.status === 'Aberta' && (
                      <button
                        onClick={finalizePayment}
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                      >
                        {loading ? "Processando..." : (
                          <>
                            <Wallet className="w-7 h-7" />
                            Finalizar Pagamento
                          </>
                        )}
                      </button>
                    )}
                    
                    {comanda.status === 'Paga' && (
                      <div className="space-y-4">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 p-6 rounded-[2rem] flex items-center gap-4 text-emerald-700 border border-emerald-100"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-xs">Pagamento Confirmado</p>
                            <p className="font-bold text-lg">Recebido em {new Date(comanda.paidAt!).toLocaleString('pt-BR')}</p>
                          </div>
                        </motion.div>
                        <button
                          onClick={reopenComanda}
                          className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <History className="w-5 h-5" />
                          Reabrir Comanda
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px] border-dashed border-2 bg-slate-50/30"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  <Receipt className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Aguardando Seleção</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Insira o código da comanda ou selecione uma conta aberta para processar o pagamento.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {printFormat && comanda && (
        <div id="print-section">
          <PrintLayout comanda={comanda} format={printFormat} />
        </div>
      )}
    </motion.div>
  );
}
