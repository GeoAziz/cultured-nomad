import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function MentorResourcesWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4">
          <li>Resource 1: Mentoring best practices</li>
          <li>Resource 2: Session templates</li>
          <li>Resource 3: Feedback forms</li>
        </ul>
      </CardContent>
    </Card>
  );
}
