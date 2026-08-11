import type { PrismaClient } from '@prisma/client';
import { CORE_USER_IDS, SEED } from './ids.ts';

const SEED_USER_EMAILS = [
  'preet@umeed.org',
  'admin@umeed.org',
  'volunteer@umeed.org',
  'pending@seed.umeed.local',
];

async function resolveSeedVolunteerIds(prisma: PrismaClient): Promise<string[]> {
  const byEmail = await prisma.volunteers.findMany({
    where: {
      OR: SEED_USER_EMAILS.map((email) => ({
        email: { equals: email, mode: 'insensitive' as const },
      })),
    },
    select: { id: true },
  });

  return [...new Set([...Object.values(SEED.volunteers), ...byEmail.map((v) => v.id)])];
}

export async function cleanupFixtures(prisma: PrismaClient) {
  const sessionIds = [SEED.sessions.upcoming, SEED.sessions.completed];
  const volunteerIds = await resolveSeedVolunteerIds(prisma);
  const studentIds = [SEED.students.active, SEED.students.inactive];

  await prisma.student_attendance.deleteMany({
    where: {
      OR: [
        { id: SEED.attendance.student },
        { session_id: { in: sessionIds } },
        { student_id: { in: studentIds } },
      ],
    },
  });

  await prisma.volunteer_attendance.deleteMany({
    where: {
      OR: [
        { id: SEED.attendance.volunteer },
        { session_id: { in: sessionIds } },
        { volunteer_id: { in: volunteerIds } },
      ],
    },
  });

  await prisma.session_rsvps.deleteMany({
    where: {
      OR: [{ id: SEED.rsvps.volunteer }, { session_id: { in: sessionIds } }],
    },
  });

  await prisma.session_assignments.deleteMany({
    where: {
      OR: [{ id: SEED.assignments.one }, { session_id: { in: sessionIds } }],
    },
  });

  await prisma.volunteer_applications.deleteMany({
    where: { id: { in: [SEED.applications.pending, SEED.applications.rejected] } },
  });

  await prisma.contact_messages.deleteMany({
    where: { id: { in: [SEED.contact.unread, SEED.contact.read] } },
  });

  await prisma.notices.deleteMany({
    where: { id: { in: [SEED.notices.public, SEED.notices.internal] } },
  });

  await prisma.events.deleteMany({ where: { id: SEED.events.annualDay } });

  await prisma.students.deleteMany({ where: { id: { in: studentIds } } });

  await prisma.sessions.deleteMany({ where: { id: { in: sessionIds } } });

  await prisma.site_content.deleteMany({
    where: { id: { in: [SEED.content.heroTitle, SEED.content.heroSubtitle] } },
  });

  await prisma.app_settings.deleteMany({
    where: { OR: [{ id: SEED.settings.siteName }, { key: 'site_name' }] },
  });
}

/** Optional full reset: removes ALL seed accounts + fixtures (use SEED_RESET=true). */
export async function cleanupAllSeedData(prisma: PrismaClient) {
  await cleanupFixtures(prisma);

  const seedUsers = await prisma.users.findMany({
    where: {
      OR: [
        { id: { in: CORE_USER_IDS } },
        ...SEED_USER_EMAILS.map((email) => ({
          email: { equals: email, mode: 'insensitive' as const },
        })),
      ],
    },
    select: { id: true },
  });
  const userIds = seedUsers.map((u) => u.id);

  const volunteerIds = await resolveSeedVolunteerIds(prisma);
  await prisma.volunteers.deleteMany({ where: { id: { in: volunteerIds } } });

  await prisma.profiles.deleteMany({ where: { user_id: { in: userIds } } });
  await prisma.users.deleteMany({ where: { id: { in: userIds } } });
}
