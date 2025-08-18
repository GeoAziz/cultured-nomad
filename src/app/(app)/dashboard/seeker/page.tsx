interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'online' | 'in-person';
}

import { useAuth } from "@/hooks/use-auth";
import SeekerMatchWidget from "@/components/dashboard/widgets/SeekerMatchWidget";
import SeekerGoalsWidget from "@/components/dashboard/widgets/SeekerGoalsWidget";
import EventsWidget from "@/components/dashboard/widgets/EventsWidget";
import StoriesWidget from "@/components/dashboard/widgets/StoriesWidget";
import { db } from "@/lib/firebase/firebase_config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function SeekerDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "events"), where("role", "==", "seeker"));
      getDocs(q).then(snapshot => {
        setEvents(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate?.() || new Date(),
        })) as Event[]);
      });
    }
  }, [user]);

  return (
    <div className="space-y-8">
  <SeekerMatchWidget />
  <SeekerGoalsWidget />
  <EventsWidget />
  <StoriesWidget />
    </div>
  );
}
