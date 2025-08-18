interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'online' | 'in-person';
}

import RoleDashboard from "@/components/dashboard/RoleDashboard";
import AdminStatsWidget from "@/components/dashboard/widgets/AdminStatsWidget";
import EventsWidget from "@/components/dashboard/widgets/EventsWidget";
import { db } from "@/lib/firebase/firebase_config";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const q = collection(db, "events");
    getDocs(q).then(snapshot => {
      setEvents(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(),
      })) as Event[]);
    });
  }, []);

  return (
    <div className="space-y-8">
  <RoleDashboard />
  <AdminStatsWidget />
  <EventsWidget />
    </div>
  );
}
