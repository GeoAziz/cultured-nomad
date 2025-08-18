
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Target, PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const goals = [
    { id: 'goal1', label: 'Find a mentor in the FinTech space', completed: true },
    { id: 'goal2', label: 'Complete "Intro to Web3" learning path', completed: false },
    { id: 'goal3', label: 'Schedule 3 coffee chats this month', completed: false },
]

export default function SeekerGoalsWidget() {
  const completedGoals = goals.filter(g => g.completed).length;
  const progress = (completedGoals / goals.length) * 100;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Target />
            My Goals
        </CardTitle>
        <CardDescription>Track your progress and stay focused on your journey.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
            {goals.map(goal => (
                 <div key={goal.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-card/70 transition-colors">
                    <Checkbox id={goal.id} checked={goal.completed} />
                    <Label htmlFor={goal.id} className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {goal.label}
                    </Label>
                </div>
            ))}
        </div>
        <div>
            <Label>Overall Progress</Label>
            <Progress value={progress} className="mt-1" />
        </div>
      </CardContent>
      <CardFooter>
          <Button variant="outline" className="ml-auto">
            <PlusCircle className="mr-2" />
            Add New Goal
          </Button>
      </CardFooter>
    </Card>
  );
}
