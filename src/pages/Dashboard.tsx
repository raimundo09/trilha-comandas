import { useState, useEffect, useMemo } from 'react';
import { storage } from '../lib/storage';
import { Comanda } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import {
  Receipt, CheckCircle2, TrendingUp, Users, ArrowUpRight,
  DollarSign, Clock, BarChart3, PieChart as PieChartIcon,
  Zap, Star, Package, Activity
} from 'lucide-react';
import { motion } from 'motion/react';

// ─── Brand Colors ───────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0F172A',
  accent: '#06B6D4',
  accentLight: '#22D3EE',
  accentDark: '#0891B2',
  gradientStart: '#06B6D4',
  gradientEnd: '#0E7490',
  chart1: '#06B6D4',
  chart2: '#0E7490',
  chart3: '#155E75',
  chart4: '#164E63',
  chart5: '#083344',
  success: '#10B981',
  warning: '#F59E0B',
  surface: '#F8FAFC',
};

// ─── Premium Components ───────────────────────────────────────────────────

function PremiumCard({ children, className, title, subtitle, icon: Icon, action }: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("premium-card p-6 flex flex-col", className)}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

// ─── Polished SVG Charts ───────────────────────────────────────────────────

function AreaChart({ data, height = 240 }: { data: { label: string; value: number }[]; height?: number }) {
  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = 0;
  const range = maxVal - minVal;
  const w = 800;
  const h = height;
  const padding = 40;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((d.value - minVal) / range) * (h - padding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + 
    points.map((p, i) => i === 0 ? '' : `L ${p.x} ${p.y}`).join(' ');
  
  const areaD = `${pathD} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

  return (
    <div className="w-full overflow-visible">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
          </linearGradient>
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = h - padding - p * (h - padding * 2);
          return (
            <line key={i} x1={padding} y1={y} x2={w - padding} y2={y} stroke="#F1F5F9" strokeWidth="1" />
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={h - 15} textAnchor="middle" className="text-[10px] font-bold fill-slate-300 uppercase tracking-widest">{p.label}</text>
        ))}

        {/* Area */}
        <motion.path
          d={areaD}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Path Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <motion.circle
              cx={p.x} cy={p.y} r="5"
              fill="white" stroke={COLORS.accent} strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.5 }}
            />
            {/* Tooltip background on hover (simplified) */}
            <rect x={p.x - 30} y={p.y - 35} width="60" height="25" rx="6" fill="#0F172A" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            <text x={p.x} y={p.y - 18} textAnchor="middle" className="text-[10px] font-bold fill-white opacity-0 group-hover:opacity-100 transition-opacity">
              R${p.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusDonut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = 60;
  const strokeW = 16;
  const circumference = 2 * Math.PI * radius;
  let accum = 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F8FAFC" strokeWidth={strokeW} />
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const offset = -(accum / total) * circumference;
            accum += seg.value;
            return (
              <motion.circle
                key={i} cx="80" cy="80" r={radius} fill="none"
                stroke={seg.color} strokeWidth={strokeW} strokeLinecap="round"
                strokeDasharray={`${pct * circumference} ${circumference}`}
                strokeDashoffset={offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${pct * circumference} ${circumference}` }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{total}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{seg.label}</span>
            <span className="text-[11px] font-black text-slate-900 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparkLine({ data, color = COLORS.accent }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const w = 120;
  const h = 40;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - minVal) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <motion.polyline
        points={points.join(' ')}
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Dashboard Component ────────────────────────────────────────────────────

export default function Dashboard() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await storage.getComandas();
        setComandas(data);
      } catch (error) {
        console.error("Erro ao carregar comandas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const analytics = useMemo(() => {
    const open = comandas.filter(c => c.status === 'Aberta');
    const paid = comandas.filter(c => c.status === 'Paga');
    const totalRevenue = paid.reduce((acc, c) => acc + c.total, 0);
    const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;

    // Revenue by last 7 days
    const last7Days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayRevenue = paid
        .filter(c => c.paidAt && new Date(c.paidAt) >= dayStart && new Date(c.paidAt) < dayEnd)
        .reduce((s, c) => s + c.total, 0);
      last7Days.push({ label: dayStr.charAt(0).toUpperCase() + dayStr.slice(1), value: dayRevenue });
    }

    // Today's revenue
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayRevenue = paid
      .filter(c => c.paidAt && new Date(c.paidAt) >= todayStart)
      .reduce((s, c) => s + c.total, 0);
    const todayCount = paid.filter(c => c.paidAt && new Date(c.paidAt) >= todayStart).length;

    // Top services (from all items)
    const serviceMap = new Map<string, number>();
    comandas.forEach(c => {
      c.items.forEach(item => {
        serviceMap.set(item.name, (serviceMap.get(item.name) || 0) + item.quantity);
      });
    });
    const topServices = Array.from(serviceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Sparkline data (daily revenue last 14 days)
    const sparkData: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const de = new Date(ds.getTime() + 86400000);
      const rev = paid
        .filter(c => c.paidAt && new Date(c.paidAt) >= ds && new Date(c.paidAt) < de)
        .reduce((s, c) => s + c.total, 0);
      sparkData.push(rev);
    }

    return { open, paid, totalRevenue, avgTicket, last7Days, todayRevenue, todayCount, topServices, sparkData };
  }, [comandas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-cyan-100"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-cyan-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-cyan-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Receita Hoje',
      value: formatCurrency(analytics.todayRevenue),
      subtitle: `${analytics.todayCount} venda${analytics.todayCount !== 1 ? 's' : ''}`,
      icon: DollarSign,
      color: COLORS.accent,
      spark: analytics.sparkData,
    },
    {
      name: 'Comandas Abertas',
      value: analytics.open.length.toString(),
      subtitle: 'Aguardando pagamento',
      icon: Clock,
      color: COLORS.warning,
      spark: null,
    },
    {
      name: 'Receita Total',
      value: formatCurrency(analytics.totalRevenue),
      subtitle: `${analytics.paid.length} comanda${analytics.paid.length !== 1 ? 's' : ''} pagas`,
      icon: TrendingUp,
      color: COLORS.success,
      spark: null,
    },
    {
      name: 'Ticket Médio',
      value: formatCurrency(analytics.avgTicket),
      subtitle: 'Por comanda paga',
      icon: Zap,
      color: '#A855F7',
      spark: null,
    },
  ];

  const donutSegments = [
    { value: analytics.open.length, color: COLORS.warning, label: 'Abertas' },
    { value: analytics.paid.length, color: COLORS.accent, label: 'Pagas' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* ──── Header / Welcome Widget ──── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 premium-card p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none text-white overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Painel de Controle</h1>
              </div>
              <p className="text-slate-400 max-w-md font-medium text-lg">
                Gerencie seus <span className="text-cyan-400 font-bold">atendimentos</span> e acompanhe o fluxo de caixa da loja em tempo real.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="glass-pill px-6 py-3 flex items-center gap-3 bg-white/5 border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-bold text-slate-300">Sistema Operacional</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest text-right px-2">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </motion.div>

        <PremiumCard 
          title="Metas de Vendas" 
          subtitle="Meta Diária: R$ 1.500" 
          icon={Star}
          className="bg-white"
        >
          <div className="flex flex-col justify-center h-full gap-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-black text-slate-900">{((analytics.todayRevenue / 1500) * 100).toFixed(0)}%</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Atingido Hoje</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">{formatCurrency(analytics.todayRevenue)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atual</p>
              </div>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((analytics.todayRevenue / 1500) * 100, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </div>
          </div>
        </PremiumCard>
      </section>

      {/* ──── Stat Cards ──── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="premium-card p-6 bg-white group cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-50">
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              {card.spark && <SparkLine data={card.spark} color={card.color} />}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{card.name}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight transition-transform group-hover:translate-x-1 duration-300">{card.value}</h4>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ──── Charts Bento ──── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PremiumCard 
          title="Fluxo de Caixa" 
          subtitle="Receita semanal (R$)" 
          icon={TrendingUp}
          className="lg:col-span-2"
          action={
            <div className="flex gap-2">
              <div className="glass-pill px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 border-slate-100">Sete Dias</div>
            </div>
          }
        >
          <div className="h-[280px] w-full mt-4">
            <AreaChart data={analytics.last7Days} />
          </div>
        </PremiumCard>

        <PremiumCard 
          title="Status de Comandas" 
          subtitle="Carga atual do sistema" 
          icon={PieChartIcon}
        >
          <div className="py-2">
            <StatusDonut segments={donutSegments} />
          </div>
        </PremiumCard>
      </section>

      {/* ──── Bottom Bento ──── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <PremiumCard 
          title="Top Performance" 
          subtitle="Serviços mais demandados" 
          icon={ArrowUpRight}
          className="lg:col-span-2"
        >
          <div className="space-y-5 mt-6">
            {analytics.topServices.map((s, i) => {
              const colors = ['bg-cyan-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-slate-500'];
              return (
                <div key={s.name} className="flex flex-col gap-2 group">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 group-hover:text-cyan-600 transition-colors uppercase tracking-wider">{s.name}</span>
                    <span className="text-slate-900">{s.count} un.</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / analytics.topServices[0].count) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={cn("h-full rounded-full transition-all duration-500 group-hover:brightness-110", colors[i % colors.length])}
                    />
                  </div>
                </div>
              );
            })}
            {analytics.topServices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Package size={48} className="opacity-20 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Sem dados disponíveis</p>
              </div>
            )}
          </div>
        </PremiumCard>

        <PremiumCard 
          title="Atividade Recente" 
          subtitle="Últimas movimentações" 
          icon={Clock}
          className="lg:col-span-3"
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cód.</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {comandas.slice(0, 5).map((c, i) => (
                  <motion.tr 
                    key={c.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg text-sm group-hover:bg-cyan-100 group-hover:text-cyan-700 transition-colors">
                        #{c.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                        c.status === 'Aberta' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-emerald-500 text-white shadow-emerald-200'
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(c.total)}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-bold text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </section>
    </motion.div>
  );
}
