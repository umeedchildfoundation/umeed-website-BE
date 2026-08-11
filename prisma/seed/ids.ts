/** Fixed UUIDs — re-running seed replaces these rows instead of growing the DB. */
export const SEED = {
  users: {
    superAdmin: '00000000-0000-4000-8000-000000000001',
    admin: '00000000-0000-4000-8000-000000000002',
    volunteer: '00000000-0000-4000-8000-000000000003',
    pendingVolunteer: '00000000-0000-4000-8000-000000000004',
  },
  profiles: {
    superAdmin: '00000000-0000-4000-8000-000000000011',
    admin: '00000000-0000-4000-8000-000000000012',
    volunteer: '00000000-0000-4000-8000-000000000013',
    pendingVolunteer: '00000000-0000-4000-8000-000000000014',
  },
  volunteers: {
    superAdmin: '00000000-0000-4000-8000-000000000021',
    admin: '00000000-0000-4000-8000-000000000022',
    approved: '00000000-0000-4000-8000-000000000023',
    pending: '00000000-0000-4000-8000-000000000024',
  },
  students: {
    active: '00000000-0000-4000-8000-000000000031',
    inactive: '00000000-0000-4000-8000-000000000032',
  },
  sessions: {
    upcoming: '00000000-0000-4000-8000-000000000041',
    completed: '00000000-0000-4000-8000-000000000042',
  },
  applications: {
    pending: '00000000-0000-4000-8000-000000000051',
    rejected: '00000000-0000-4000-8000-000000000052',
  },
  notices: {
    public: '00000000-0000-4000-8000-000000000061',
    internal: '00000000-0000-4000-8000-000000000062',
  },
  events: {
    annualDay: '00000000-0000-4000-8000-000000000071',
  },
  contact: {
    unread: '00000000-0000-4000-8000-000000000081',
    read: '00000000-0000-4000-8000-000000000082',
  },
  assignments: {
    one: '00000000-0000-4000-8000-000000000091',
  },
  attendance: {
    student: '00000000-0000-4000-8000-0000000000a1',
    volunteer: '00000000-0000-4000-8000-0000000000a2',
  },
  rsvps: {
    volunteer: '00000000-0000-4000-8000-0000000000b1',
  },
  content: {
    heroTitle: '00000000-0000-4000-8000-0000000000c1',
    heroSubtitle: '00000000-0000-4000-8000-0000000000c2',
  },
  settings: {
    siteName: '00000000-0000-4000-8000-0000000000d1',
  },
} as const;

/** All fixture IDs for cleanup (excludes core user accounts managed via upsert). */
export const FIXTURE_IDS = [
  SEED.students.active,
  SEED.students.inactive,
  SEED.sessions.upcoming,
  SEED.sessions.completed,
  SEED.applications.pending,
  SEED.applications.rejected,
  SEED.notices.public,
  SEED.notices.internal,
  SEED.events.annualDay,
  SEED.contact.unread,
  SEED.contact.read,
  SEED.assignments.one,
  SEED.attendance.student,
  SEED.attendance.volunteer,
  SEED.rsvps.volunteer,
  SEED.content.heroTitle,
  SEED.content.heroSubtitle,
  SEED.settings.siteName,
];

export const CORE_USER_IDS = Object.values(SEED.users);
