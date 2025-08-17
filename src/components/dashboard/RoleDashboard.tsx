"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRoleFeatures } from '@/hooks/use-role-features';
import MentorDashboardStats from './widgets/MentorDashboardStats';
import SeekerMatchWidget from './widgets/SeekerMatchWidget';
import TechieResourcesWidget from './widgets/TechieResourcesWidget';
import EventsWidget from './widgets/EventsWidget';
import StoriesWidget from './widgets/StoriesWidget';
import RoleAnalytics from './analytics/RoleAnalytics';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function RoleDashboard() {
  const { user } = useAuth();
  const roleFeatures = useRoleFeatures();

  if (!user) return null;

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case 'mentor':
        return (
          <motion.div variants={itemVariants}>
            <MentorDashboardStats />
          </motion.div>
        );
      case 'seeker':
        return (
          <motion.div variants={itemVariants}>
            <SeekerMatchWidget />
          </motion.div>
        );
      case 'techie':
        return (
          <motion.div variants={itemVariants}>
            <TechieResourcesWidget />
          </motion.div>
        );
      default:
        return (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Welcome to your dashboard!</h3>
              <p className="text-muted-foreground">
                Explore events, connect with others, and make the most of your membership.
              </p>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Role-specific content */}
      {renderRoleSpecificContent()}

      {/* Role-based analytics */}
      <motion.div variants={itemVariants}>
        <RoleAnalytics />
      </motion.div>

      {/* Shared features based on role permissions */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={itemVariants}
      >
        {roleFeatures.features.events && (
          <EventsWidget />
        )}

        {roleFeatures.features.stories && (
          <StoriesWidget />
        )}

        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.role === 'mentor' && (
                <>
                  <Button className="w-full" variant="outline">Schedule Session</Button>
                  <Button className="w-full" variant="outline">Share Resource</Button>
                </>
              )}
              {user.role === 'seeker' && (
                <>
                  <Button className="w-full" variant="outline">Find Mentor</Button>
                  <Button className="w-full" variant="outline">Set Learning Goal</Button>
                </>
              )}
              {user.role === 'techie' && (
                <>
                  <Button className="w-full" variant="outline">Share Project</Button>
                  <Button className="w-full" variant="outline">Browse Resources</Button>
                </>
              )}
              {user.role === 'member' && (
                <>
                  <Button className="w-full" variant="outline">Connect with Members</Button>
                  <Button className="w-full" variant="outline">Share Story</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
