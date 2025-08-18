import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function SeekerGoalsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4">
          <li>Goal 1: Find a mentor</li>
          <li>Goal 2: Complete a learning path</li>
          <li>Goal 3: Track progress</li>
        </ul>
      </CardContent>
    </Card>
  );
}
