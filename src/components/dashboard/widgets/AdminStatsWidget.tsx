import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function AdminStatsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4">
          <li>Total Users: 120</li>
          <li>Active Sessions: 15</li>
          <li>Pending Approvals: 3</li>
        </ul>
      </CardContent>
    </Card>
  );
}
