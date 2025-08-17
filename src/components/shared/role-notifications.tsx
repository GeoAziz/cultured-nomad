"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Calendar, Users, MessageSquare, Heart, Star, Code } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

const roleNotificationTypes: Record<string, string[]> = {
  mentor: ['session_request', 'mentee_progress', 'feedback_received'],
  seeker: ['mentor_match', 'session_confirmed', 'goal_achieved'],
  techie: ['project_contribution', 'resource_liked', 'tech_update'],
  member: ['event_reminder', 'connection_request', 'story_liked'],
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'session_request':
    case 'session_confirmed':
      return Calendar;
    case 'mentor_match':
    case 'connection_request':
      return Users;
    case 'feedback_received':
    case 'story_liked':
      return Heart;
    case 'goal_achieved':
    case 'mentee_progress':
      return Star;
    case 'project_contribution':
    case 'tech_update':
      return Code;
    default:
      return MessageSquare;
  }
};

export default function RoleNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const db = getFirestore(app);
    const notificationTypes = roleNotificationTypes[user.role] || roleNotificationTypes.member;
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('type', 'in', notificationTypes),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Notification[];

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const db = getFirestore(app);
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.read && "bg-accent/5"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className={cn("text-sm", !notification.read && "font-medium")}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-sm text-primary" asChild>
          <a href="/notifications">View All Notifications</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
