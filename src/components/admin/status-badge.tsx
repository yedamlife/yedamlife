import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: {
    label: '접수',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  in_progress: {
    label: '진행중',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  completed: {
    label: '완료',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

export { STATUS_MAP };
