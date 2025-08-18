# Page Architecture

This document summarizes the separation of shared and role-based pages in the codebase.

## Role-Based (Separate) Pages
- `/dashboard/mentor/page.tsx` — Mentor dashboard
- `/dashboard/seeker/page.tsx` — Seeker dashboard (Note: Seekers are the user role for mentees)
- `/dashboard/admin/page.tsx` — Admin dashboard
- `/connect/mentor/page.tsx` — Mentor connect
- `/connect/seeker/page.tsx` — Seeker connect
- `/events/mentor/page.tsx` — Mentor events
- `/events/seeker/page.tsx` — Seeker events
- `/mentorship/mentor/page.tsx` — Mentor mentorship
- `/mentorship/seeker/page.tsx` — Seeker mentorship

## Shared Pages (Accessible by All Roles)
- `/dashboard/RoleDashboard.tsx` — Shared dashboard logic/components
- `/members/` — Member directory
- `/events/` — General events listing
- `/stories/` — Stories page
- `/settings/` — Settings page
- `/profile/` — Profile page
- `/wellness/` — Wellness page

## Navigation
- Sidebar and navigation components dynamically show/hide links based on user role.

---

*Update this document as you add or change pages in the codebase.*
