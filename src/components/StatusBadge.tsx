import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'available' | 'low' | 'missing';
  showLabel?: boolean;
  count?: number;
}

const statusConfig = {
  available: { color: 'bg-status-available', label: 'Available' },
  low: { color: 'bg-status-low', label: 'Low Stock' },
  missing: { color: 'bg-status-missing', label: 'Missing' },
};

const StatusBadge = ({ status, showLabel = false, count }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
      {showLabel && (
        <span className="text-sm text-foreground/70">
          {config.label}
          {count !== undefined && <span className="font-semibold ml-1">({count})</span>}
        </span>
      )}
    </span>
  );
};

export default StatusBadge;
