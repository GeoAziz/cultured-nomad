
// import { UserRole } from "@/context/auth-context";

import { useAuth } from './use-auth';

export type UserRole = 'admin' | 'mentor' | 'seeker' | 'techie' | 'member';

export interface RoleFeatures {
  canMentor: boolean;
  canSeekMentorship: boolean;
  canShareTechResources: boolean;
  canAccessAdmin: boolean;
  features: {
    mentorship: boolean;
    events: boolean;
    stories: boolean;
    resources: boolean;
    analytics: boolean;
  };
  widgets: string[];
}

export const useRoleFeatures = (): RoleFeatures => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canMentor: false,
      canSeekMentorship: false,
      canShareTechResources: false,
      canAccessAdmin: false,
      features: {
        mentorship: false,
        events: false,
        stories: false,
        resources: false,
        analytics: false,
      },
      widgets: [],
    };
  }

  const baseFeatures = {
    events: true,
    stories: true,
  };

  switch (user.role) {
    case 'admin':
      return {
        canMentor: true,
        canSeekMentorship: false,
        canShareTechResources: true,
        canAccessAdmin: true,
        features: {
          ...baseFeatures,
          mentorship: true,
          resources: true,
          analytics: true,
        },
        widgets: ['AdminStats', 'UserManagement', 'Analytics'],
      };

    case 'mentor':
      return {
        canMentor: true,
        canSeekMentorship: false,
        canShareTechResources: true,
        canAccessAdmin: false,
        features: {
          ...baseFeatures,
          mentorship: true,
          resources: true,
          analytics: false,
        },
        widgets: ['MentorStats', 'Sessions', 'Resources'],
      };

    case 'seeker':
      return {
        canMentor: false,
        canSeekMentorship: true,
        canShareTechResources: false,
        canAccessAdmin: false,
        features: {
          ...baseFeatures,
          mentorship: true,
          resources: true,
          analytics: false,
        },
        widgets: ['MentorMatch', 'Goals', 'Learning'],
      };

    case 'techie':
      return {
        canMentor: false,
        canSeekMentorship: false,
        canShareTechResources: true,
        canAccessAdmin: false,
        features: {
          ...baseFeatures,
          mentorship: false,
          resources: true,
          analytics: false,
        },
        widgets: ['TechResources', 'Projects', 'Network'],
      };

    default:
      return {
        canMentor: false,
        canSeekMentorship: true,
        canShareTechResources: false,
        canAccessAdmin: false,
        features: {
          ...baseFeatures,
          mentorship: false,
          resources: true,
          analytics: false,
        },
        widgets: ['Feed', 'Events', 'Connect'],
      };
  }
};
