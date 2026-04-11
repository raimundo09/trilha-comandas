import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Receipt, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Attendant from './pages/Attendant';
import Cashier from './pages/Cashier';
import Services from './pages/Services';
import { cn } from './lib/utils';

const LOGO_URL = "https://i.imgur.com/zUZ7WJN.png";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Atendente', path: '/atendente', icon: UserPlus },
    { name: 'Caixa', path: '/caixa', icon: Receipt },
    { name: 'Serviços', path: '/servicos', icon: Package },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 no-print shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative p-1">
                <img 
                  src={LOGO_URL} 
                  alt="Trilha Tecnologia" 
                  className="h-10 w-auto relative"
                  referrerPolicy="no-referrer"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5",
                  location.pathname === item.path
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-4 rounded-2xl text-base font-bold flex items-center gap-4 transition-all",
                    location.pathname === item.path
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-100"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-slate-400")} />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-100 selection:text-cyan-900">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/atendente" element={<Attendant />} />
            <Route path="/caixa" element={<Cashier />} />
            <Route path="/servicos" element={<Services />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
