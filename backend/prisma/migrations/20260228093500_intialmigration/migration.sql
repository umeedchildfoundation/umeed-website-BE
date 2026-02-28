-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('public', 'internal');

-- CreateEnum
CREATE TYPE "public"."RsvpResponse" AS ENUM ('yes', 'no', 'maybe');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('text', 'image', 'number', 'json');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');

-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('volunteer', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "public"."VolunteerStatus" AS ENUM ('pending', 'approved', 'rejected', 'inactive');

-- CreateTable
CREATE TABLE "public"."app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_media" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" "public"."MediaType" NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "event_date" TEXT,
    "location" TEXT,
    "tags" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "url" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "filename" TEXT,
    "mimetype" TEXT,
    "size" INTEGER,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "published_date" TEXT,
    "attachment_url" TEXT,
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'public',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'volunteer',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_assignments" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_rsvps" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "response" "public"."RsvpResponse",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "date" TEXT NOT NULL,
    "session_date" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "status" TEXT,
    "rsvp_enabled" INTEGER DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_content" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" "public"."ContentType" NOT NULL DEFAULT 'text',
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_attendance" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'absent',
    "remark" TEXT,
    "marked_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "marked_by" TEXT,

    CONSTRAINT "student_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "full_name" TEXT NOT NULL,
    "gender" TEXT,
    "date_of_birth" TEXT,
    "school_name" TEXT,
    "class_grade" TEXT,
    "parent_name" TEXT,
    "parent_guardian_name" TEXT,
    "parent_contact" TEXT,
    "parent_contact_number" TEXT,
    "address" TEXT,
    "area" TEXT,
    "area_locality" TEXT,
    "status" "public"."StudentStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "enrollment_date" TEXT,
    "image_url" TEXT,
    "roll_number" TEXT,
    "location_code" TEXT,
    "documents" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'volunteer',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'volunteer',
    "preferences" TEXT,
    "raw_user_meta_data" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_applications" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "address" TEXT,
    "occupation" TEXT,
    "availability" TEXT,
    "motivation" TEXT,
    "skills_subjects" TEXT,
    "preferred_languages" TEXT,
    "status" "public"."VolunteerStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteer_attendance" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'absent',
    "remark" TEXT,
    "marked_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "marked_by" TEXT,

    CONSTRAINT "volunteer_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "volunteer_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "address" TEXT,
    "occupation" TEXT,
    "skills" TEXT,
    "preferred_languages" TEXT,
    "availability" TEXT,
    "status" "public"."VolunteerStatus" NOT NULL DEFAULT 'pending',
    "joined_at" TEXT,
    "profile_picture" TEXT,
    "documents" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "public"."app_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_content_section_key_key" ON "public"."site_content"("section", "key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."event_media" ADD CONSTRAINT "event_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_assignments" ADD CONSTRAINT "session_assignments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_assignments" ADD CONSTRAINT "session_assignments_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_assignments" ADD CONSTRAINT "session_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_rsvps" ADD CONSTRAINT "session_rsvps_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_rsvps" ADD CONSTRAINT "session_rsvps_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_attendance" ADD CONSTRAINT "student_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_attendance" ADD CONSTRAINT "student_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_attendance" ADD CONSTRAINT "volunteer_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteer_attendance" ADD CONSTRAINT "volunteer_attendance_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."volunteers" ADD CONSTRAINT "volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
