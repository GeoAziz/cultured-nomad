interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'online' | 'in-person';
}

import { useAuth } from "@/hooks/use-auth";
import MentorDashboardStats from "@/components/dashboard/widgets/MentorDashboardStats";
// Ensure the file exists at the specified path, or update the import path if needed
// import MentorResourcesWidget from "@/components/dashboard/widgets/MentorResourcesWidget";
// Update the import path below if the file exists elsewhere:
import MentorResourcesWidget from "@/components/dashboard/widgets/MentorResourcesWidget"; // <-- Ensure this file exists
import EventsWidget from "@/components/dashboard/widgets/EventsWidget";
import StoriesWidget from "@/components/dashboard/widgets/StoriesWidget";
import { db } from "@/lib/firebase/firebase_config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "events"), where("role", "==", "mentor"));
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
  <MentorDashboardStats />
  <MentorResourcesWidget />
  <EventsWidget />
  <StoriesWidget />
    </div>
  );
}
