
import { UserRole } from "@/context/auth-context";

export const useRoleFeatures = (role: UserRole) => {
  return {
    canMentor: role === 'mentor',
    canSeekMentorship: role === 'seeker',
    showTechResources: role === 'techie',
    // Add more feature flags as the platform grows
  };
};
