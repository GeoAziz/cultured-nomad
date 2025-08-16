
"use client";

import type { UserRole } from "@/hooks/use-auth";
import MemberDashboard from "./MemberDashboard";
import MentorDashboard from "./MentorDashboard";
import SeekerDashboard from "./SeekerDashboard";
import TechieDashboard from "./TechieDashboard";
import AdminDashboard from "@/app/(admin)/admin/dashboard/page";
import { motion } from "framer-motion";

interface RoleBasedContentProps {
    userRole: UserRole;
}

export default function RoleBasedContent({ userRole }: RoleBasedContentProps) {
    const roleComponents = {
        mentor: <MentorDashboard />,
        seeker: <SeekerDashboard />,
        techie: <TechieDashboard />,
        member: <MemberDashboard />,
        admin: <MemberDashboard /> // Admins see a member view in the main app
    };

    const ComponentToRender = roleComponents[userRole] || <MemberDashboard />;

    return (
        <motion.div 
            key={userRole}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="role-content"
        >
            {ComponentToRender}
        </motion.div>
    );
};
