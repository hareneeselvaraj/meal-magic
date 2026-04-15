import GlassCard from '@/components/GlassCard';
import { historyData } from '@/data/mockData';

const History = () => {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">History</h1>

      <div className="space-y-4">
        {historyData.map((entry) => {
          const date = new Date(entry.date).toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          return (
            <div key={entry.date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <p className="text-sm font-semibold text-foreground/70">{date}</p>
              </div>
              <GlassCard className="ml-6 space-y-2">
                {entry.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-foreground/80">{item.name}</span>
                    <span className="text-emerald-600 font-medium">{item.change}</span>
                  </div>
                ))}
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
