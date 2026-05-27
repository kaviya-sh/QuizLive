import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AnswerDistributionChartProps {
  data: Array<{
    option: string;
    count: number;
    isCorrect?: boolean;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const AnswerDistributionChart = ({ data }: AnswerDistributionChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" stroke="#9CA3AF" />
        <YAxis dataKey="option" type="category" stroke="#9CA3AF" width={150} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isCorrect ? '#10B981' : COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
