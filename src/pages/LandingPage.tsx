import {
  Wallet, Plane, Home as HomeIcon, ArrowRight, Check, BarChart3,
  Users, Receipt, Calculator, Moon, Sun, Sparkles,
} from 'lucide-react';
import { useTheme } from '@/theme';
import { useRouter } from '@/router';
import { formatCurrency } from '@/utils';

export function LandingPage({ onDemo }: { onDemo: () => void }) {
  const { theme, toggle } = useTheme();
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Nav bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">SplitSmart</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-ghost hidden sm:flex">Dashboard</button>
            <button onClick={() => navigate('/groups')} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-medium mb-6 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5" />
          Smart Shared Expense Management
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] max-w-3xl mx-auto animate-slideUp">
          Split expenses.<br />
          Stay fair. <span className="text-brand-600">Live simpler.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slideUp">
          SplitSmart makes shared expenses effortless — whether you're travelling with friends or sharing a home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fadeIn">
          <button onClick={() => navigate('/groups')} className="btn-primary px-6 py-3 text-base">
            Create a Group <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onDemo} className="btn-secondary px-6 py-3 text-base">
            Explore Demo
          </button>
        </div>
      </section>

      {/* Mode cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-5">
          <button
            onClick={() => navigate('/groups')}
            className="group text-left card p-7 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trip Mode</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Perfect for vacations, outings and group trips.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Food', 'Hotel', 'Fuel', 'Activities'].map((c) => (
                <span key={c} className="chip bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{c}</span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium">
              Start a trip <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/groups')}
            className="group text-left card p-7 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4">
              <HomeIcon className="w-6 h-6 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shared Living</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Perfect for roommates, hostels and shared homes.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Rent', 'Utilities', 'Groceries', 'Internet'].map((c) => (
                <span key={c} className="chip bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{c}</span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium">
              Set up home <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
          A dashboard that makes sense of it all
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Track spending, balances, and settlements in one beautiful view.
        </p>
        <div className="card p-5 sm:p-8 shadow-soft">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'Total Spent', value: formatCurrency(12450), icon: Receipt, color: 'text-gray-700 dark:text-gray-200' },
              { label: 'You Owe', value: formatCurrency(650), icon: ArrowRight, color: 'text-red-500' },
              { label: "You're Owed", value: formatCurrency(1200), icon: ArrowRight, color: 'text-brand-500' },
              { label: 'Remaining', value: formatCurrency(5550), icon: BarChart3, color: 'text-blue-500' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Budget Usage</span>
              <span className="font-medium text-gray-900 dark:text-white">62%</span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Users, title: 'Group Management', desc: 'Create groups, add members, and manage who shares what.' },
            { icon: Calculator, title: '5 Split Methods', desc: 'Equal, custom, percentage, usage-based, or selected members.' },
            { icon: Receipt, title: 'Smart Settlement', desc: 'Minimized transactions so everyone settles up faster.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="card p-8 sm:p-12 bg-gradient-to-br from-brand-600 to-brand-700 border-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to split smarter?</h2>
          <p className="text-brand-100 mb-6 text-sm">Create your first group and start tracking expenses in minutes.</p>
          <button onClick={() => navigate('/groups')} className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold rounded-xl px-6 py-3 hover:bg-brand-50 transition-colors">
            Create a Group <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="w-4 h-4" />
          <span className="font-semibold text-gray-500">SplitSmart</span>
        </div>
        Smart Shared Expense Management — Frontend ready for C backend integration.
      </footer>
    </div>
  );
}
