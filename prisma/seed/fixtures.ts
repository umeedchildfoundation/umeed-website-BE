import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED } from './ids.ts';

const PASSWORD = 'admin2026';
const VOLUNTEER_PASSWORD = 'volunteer2026';

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

export type SeedContext = {
  userIds: {
    superAdmin: string;
    admin: string;
    volunteer: string;
    pendingVolunteer: string;
  };
  volunteerIds: {
    superAdmin: string;
    admin: string;
    approved: string;
    pending: string;
  };
};

export async function upsertCoreUsers(prisma: PrismaClient): Promise<SeedContext> {
  const now = new Date().toISOString();
  const adminHash = await hash(PASSWORD);
  const volunteerHash = await hash(VOLUNTEER_PASSWORD);

  const accounts = [
    {
      key: 'superAdmin' as const,
      volunteerKey: 'superAdmin' as const,
      preferredUserId: SEED.users.superAdmin,
      profileId: SEED.profiles.superAdmin,
      preferredVolunteerId: SEED.volunteers.superAdmin,
      email: 'preet@umeed.org',
      fullName: 'Preet (Super Admin)',
      role: 'super_admin' as const,
      volunteerCode: 'UMV1001',
      volunteerStatus: 'approved' as const,
      passwordHash: adminHash,
    },
    {
      key: 'admin' as const,
      volunteerKey: 'admin' as const,
      preferredUserId: SEED.users.admin,
      profileId: SEED.profiles.admin,
      preferredVolunteerId: SEED.volunteers.admin,
      email: 'admin@umeed.org',
      fullName: 'Admin User',
      role: 'admin' as const,
      volunteerCode: 'UMV1002',
      volunteerStatus: 'approved' as const,
      passwordHash: adminHash,
    },
    {
      key: 'volunteer' as const,
      volunteerKey: 'approved' as const,
      preferredUserId: SEED.users.volunteer,
      profileId: SEED.profiles.volunteer,
      preferredVolunteerId: SEED.volunteers.approved,
      email: 'volunteer@umeed.org',
      fullName: 'Demo Volunteer',
      role: 'volunteer' as const,
      volunteerCode: 'UMV1003',
      volunteerStatus: 'approved' as const,
      passwordHash: volunteerHash,
    },
    {
      key: 'pendingVolunteer' as const,
      volunteerKey: 'pending' as const,
      preferredUserId: SEED.users.pendingVolunteer,
      profileId: SEED.profiles.pendingVolunteer,
      preferredVolunteerId: SEED.volunteers.pending,
      email: 'pending@seed.umeed.local',
      fullName: 'Pending Volunteer',
      role: 'volunteer' as const,
      volunteerCode: 'UMV1004',
      volunteerStatus: 'pending' as const,
      passwordHash: volunteerHash,
    },
  ];

  const ctx: SeedContext = {
    userIds: {
      superAdmin: '',
      admin: '',
      volunteer: '',
      pendingVolunteer: '',
    },
    volunteerIds: {
      superAdmin: '',
      admin: '',
      approved: '',
      pending: '',
    },
  };

  for (const a of accounts) {
    const email = a.email.toLowerCase();

    let user = await prisma.users.findFirst({
      where: { email: { equals: a.email, mode: 'insensitive' } },
    });

    if (user) {
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          full_name: a.fullName,
          role: a.role,
          password_hash: a.passwordHash,
        },
      });
    } else {
      user = await prisma.users.create({
        data: {
          id: a.preferredUserId,
          email,
          password_hash: a.passwordHash,
          full_name: a.fullName,
          role: a.role,
        },
      });
    }

    ctx.userIds[a.key] = user.id;

    const profile = await prisma.profiles.findUnique({ where: { user_id: user.id } });
    if (profile) {
      await prisma.profiles.update({
        where: { id: profile.id },
        data: { email, full_name: a.fullName, role: a.role },
      });
    } else {
      await prisma.profiles.create({
        data: {
          id: a.profileId,
          user_id: user.id,
          email,
          full_name: a.fullName,
          role: a.role,
        },
      });
    }

    let volunteer = await prisma.volunteers.findFirst({
      where: {
        OR: [
          { user_id: user.id },
          { email: { equals: a.email, mode: 'insensitive' } },
        ],
      },
    });

    if (volunteer) {
      volunteer = await prisma.volunteers.update({
        where: { id: volunteer.id },
        data: {
          user_id: user.id,
          volunteer_id: a.volunteerCode,
          name: a.fullName,
          email,
          status: a.volunteerStatus,
        },
      });
    } else {
      volunteer = await prisma.volunteers.create({
        data: {
          id: a.preferredVolunteerId,
          user_id: user.id,
          volunteer_id: a.volunteerCode,
          name: a.fullName,
          email,
          status: a.volunteerStatus,
          joined_at: now,
        },
      });
    }

    ctx.volunteerIds[a.volunteerKey] = volunteer.id;
    console.log(`  [user] ${a.email} (${a.role})`);
  }

  return ctx;
}

export async function seedFixtures(prisma: PrismaClient, ctx: SeedContext) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const pastDate = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);

  await prisma.students.createMany({
    data: [
      {
        id: SEED.students.active,
        full_name: 'Seed Student Active',
        roll_number: 'SEED-001',
        class_grade: '8',
        school_name: 'UMEED Test School',
        status: 'active',
        parent_contact_number: '9876543210',
        area_locality: 'Test Area',
      },
      {
        id: SEED.students.inactive,
        full_name: 'Seed Student Inactive',
        roll_number: 'SEED-002',
        class_grade: '6',
        status: 'inactive',
      },
    ],
  });
  console.log('  [students] 2');

  await prisma.sessions.createMany({
    data: [
      {
        id: SEED.sessions.upcoming,
        title: 'Seed Upcoming Session',
        date: dateStr,
        session_date: dateStr,
        start_time: '10:00',
        end_time: '12:00',
        location: 'UMEED Center',
        status: 'scheduled',
        rsvp_enabled: 1,
        created_by: ctx.userIds.admin,
      },
      {
        id: SEED.sessions.completed,
        title: 'Seed Completed Session',
        date: pastDate,
        session_date: pastDate,
        status: 'completed',
        created_by: ctx.userIds.admin,
      },
    ],
  });
  console.log('  [sessions] 2');

  await prisma.volunteer_applications.createMany({
    data: [
      {
        id: SEED.applications.pending,
        full_name: 'Seed Applicant Pending',
        email: 'applicant.pending@seed.umeed.local',
        phone: '9000000001',
        motivation: 'I want to help children learn.',
        skills_subjects: JSON.stringify(['Math', 'English']),
        preferred_languages: JSON.stringify(['Hindi', 'English']),
        status: 'pending',
      },
      {
        id: SEED.applications.rejected,
        full_name: 'Seed Applicant Rejected',
        email: 'applicant.rejected@seed.umeed.local',
        phone: '9000000002',
        motivation: 'Previous application for edge-case testing.',
        status: 'rejected',
        reviewed_by: ctx.userIds.admin,
        reviewed_at: new Date().toISOString(),
      },
    ],
  });
  console.log('  [applications] 2 (pending + rejected — approve pending to test email)');

  await prisma.notices.createMany({
    data: [
      {
        id: SEED.notices.public,
        title: 'Seed Public Notice',
        description: 'Visible to everyone including logged-out users.',
        date: dateStr,
        visibility: 'public',
        created_by: ctx.userIds.admin,
      },
      {
        id: SEED.notices.internal,
        title: 'Seed Internal Notice',
        description: 'Only visible to authenticated users.',
        date: dateStr,
        visibility: 'internal',
        created_by: ctx.userIds.admin,
      },
    ],
  });
  console.log('  [notices] 2');

  await prisma.events.create({
    data: {
      id: SEED.events.annualDay,
      title: 'Seed Annual Day',
      description: 'Test event for media and listing.',
      date: dateStr,
      event_date: dateStr,
      location: 'UMEED Hall',
      tags: JSON.stringify(['community', 'celebration']),
    },
  });
  console.log('  [events] 1');

  await prisma.contact_messages.createMany({
    data: [
      {
        id: SEED.contact.unread,
        name: 'Seed Visitor',
        email: 'visitor@seed.umeed.local',
        message: 'Unread contact message for admin inbox testing.',
        is_read: 0,
      },
      {
        id: SEED.contact.read,
        name: 'Seed Alumni',
        email: 'alumni@seed.umeed.local',
        message: 'Already read contact message.',
        is_read: 1,
      },
    ],
  });
  console.log('  [contact] 2');

  await prisma.site_content.createMany({
    data: [
      {
        id: SEED.content.heroTitle,
        section: 'home',
        key: 'hero_title',
        value: 'Welcome to UMEED (Seed Data)',
        type: 'text',
      },
      {
        id: SEED.content.heroSubtitle,
        section: 'home',
        key: 'hero_subtitle',
        value: 'Empowering children through education',
        type: 'text',
      },
    ],
  });
  console.log('  [content] 2');

  await prisma.app_settings.upsert({
    where: { key: 'site_name' },
    create: {
      id: SEED.settings.siteName,
      key: 'site_name',
      value: 'UMEED Children Foundation',
    },
    update: { value: 'UMEED Children Foundation' },
  });
  console.log('  [settings] 1');

  await prisma.session_assignments.create({
    data: {
      id: SEED.assignments.one,
      session_id: SEED.sessions.upcoming,
      volunteer_id: ctx.volunteerIds.approved,
      student_id: SEED.students.active,
    },
  });
  console.log('  [assignments] 1');

  await prisma.student_attendance.create({
    data: {
      id: SEED.attendance.student,
      session_id: SEED.sessions.completed,
      student_id: SEED.students.active,
      status: 'present',
      marked_by: ctx.userIds.admin,
    },
  });

  await prisma.volunteer_attendance.create({
    data: {
      id: SEED.attendance.volunteer,
      session_id: SEED.sessions.completed,
      volunteer_id: ctx.volunteerIds.approved,
      status: 'present',
      marked_by: ctx.userIds.admin,
    },
  });
  console.log('  [attendance] student + volunteer');

  await prisma.session_rsvps.create({
    data: {
      id: SEED.rsvps.volunteer,
      session_id: SEED.sessions.upcoming,
      volunteer_id: ctx.volunteerIds.approved,
      response: 'yes',
    },
  });
  console.log('  [rsvps] 1');
}
