import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export function StatsCards({ total, pending, inProgress, completed }: StatsCardsProps) {
  const cards = [
    { label: '전체', value: total, className: 'bg-gray-700 text-white border-gray-700' },
    { label: '접수', value: pending, className: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    { label: '진행중', value: inProgress, className: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: '완료', value: completed, className: 'bg-green-50 text-green-600 border-green-200' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={card.className}>
          <CardContent className="flex items-center justify-between px-6 py-4">
            <span className="text-sm font-medium opacity-80">{card.label}</span>
            <span className="text-2xl font-bold">{card.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
