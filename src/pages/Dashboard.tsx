import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Comanda } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Receipt, CheckCircle2, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = storage.getComandas();
    setComandas(data);
    setLoading(false);
  }, []);

  const openComandas = comandas.filter(c => c.status === 'Aberta');
  const paidComandas = comandas.filter(c => c.status === 'Paga');
  const totalRevenue = paidComandas.reduce((acc, curr) => acc + curr.total, 0);

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

  const stats = [
    { name: 'Comandas Abertas', value: openComandas.length, icon: Users, color: 'text-slate-900', bg: 'bg-slate-100' },
    { name: 'Comandas Pagas', value: paidComandas.length, icon: CheckCircle2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Receita Total', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-slate-900', bg: 'bg-slate-100' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestão de vendas e comandas da Papelaria.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Sistema Online
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="premium-card p-8 flex items-center gap-6"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-8 h-8", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Comandas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-900">Comandas Recentes</h2>
          <button className="text-cyan-600 font-bold text-sm hover:text-cyan-700 flex items-center gap-1 transition-colors">
            Ver tudo <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4 font-bold">Código</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Total</th>
                <th className="px-8 py-4 font-bold">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {comandas.slice(0, 8).map((comanda) => (
                <tr key={comanda.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                      {comanda.code}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider",
                      comanda.status === 'Aberta' 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-emerald-100 text-emerald-700"
                    )}>
                      {comanda.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900">{formatCurrency(comanda.total)}</td>
                  <td className="px-8 py-5 text-slate-400 text-sm font-medium">
                    {new Date(comanda.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
              {comandas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-bold">Nenhuma comanda registrada ainda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
