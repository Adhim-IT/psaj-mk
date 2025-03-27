-- CreateEnum
CREATE TYPE "course_types_type" AS ENUM ('group', 'private', 'batch');

-- CreateEnum
CREATE TYPE "promo_codes_discount_type" AS ENUM ('fixed', 'percentage');

-- CreateEnum
CREATE TYPE "course_transactions_type" AS ENUM ('group', 'private', 'batch');

-- CreateEnum
CREATE TYPE "students_gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "event_registrants_status" AS ENUM ('pending', 'paid', 'rejected');

-- CreateEnum
CREATE TYPE "mentors_gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "students_occupation_type" AS ENUM ('student', 'employee', 'business', 'other');

-- CreateEnum
CREATE TYPE "course_transactions_status" AS ENUM ('paid', 'unpaid', 'failed');

-- CreateEnum
CREATE TYPE "course_types_discount_type" AS ENUM ('percentage', 'fixed');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "article_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_category_pivot" (
    "id" BIGSERIAL NOT NULL,
    "article_id" TEXT NOT NULL,
    "article_category_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_category_pivot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "article_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tag_pivot" (
    "id" BIGSERIAL NOT NULL,
    "article_id" TEXT NOT NULL,
    "article_tag_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_tag_pivot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_visitors" (
    "id" SERIAL NOT NULL,
    "visitor_ip" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "article_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "writer_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_category_pivot" (
    "course_id" TEXT NOT NULL,
    "course_category_id" TEXT NOT NULL,

    CONSTRAINT "course_category_pivot_pkey" PRIMARY KEY ("course_id","course_category_id")
);

-- CreateTable
CREATE TABLE "course_reviews" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_student_groups" (
    "id" TEXT NOT NULL,
    "course_type_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "remarks" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_meeting" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_students" (
    "id" TEXT NOT NULL,
    "course_student_group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_syllabus" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_tool_pivot" (
    "course_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,

    CONSTRAINT "course_tool_pivot_pkey" PRIMARY KEY ("course_id","tool_id")
);

-- CreateTable
CREATE TABLE "course_transactions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "type" "course_transactions_type" NOT NULL,
    "batch_number" INTEGER,
    "status" "course_transactions_status" NOT NULL DEFAULT 'unpaid',
    "original_price" DECIMAL(20,4) NOT NULL,
    "discount" DECIMAL(20,4),
    "final_price" DECIMAL(20,4) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_types" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "type" "course_types_type" NOT NULL,
    "batch_number" INTEGER,
    "slug" TEXT NOT NULL,
    "normal_price" DECIMAL(20,4) NOT NULL,
    "discount_type" "course_types_discount_type",
    "discount" DECIMAL(20,4),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_discount" BOOLEAN NOT NULL DEFAULT false,
    "is_voucher" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "course_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "trailer" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "meetings" INTEGER NOT NULL,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_request" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrants" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "instagram_follow" TEXT,
    "payment_proof" TEXT,
    "status" "event_registrants_status" NOT NULL DEFAULT 'pending',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "event_registrants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_reviews" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "event_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2),
    "whatsapp_group_link" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "faq_category_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_earnings" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "event_id" TEXT,
    "course_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mentor_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "gender" "mentors_gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "migration" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" TEXT NOT NULL,
    "tokenable_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "promo_codes_discount_type" NOT NULL,
    "discount" INTEGER NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "students_gender",
    "occupation_type" "students_occupation_type",
    "profile_picture" TEXT,
    "occupation" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT,
    "remember_token" TEXT,
    "image" TEXT,
    "role_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "writers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "article_categories_slug_key" ON "article_categories"("slug");

-- CreateIndex
CREATE INDEX "article_category_pivot_article_category_id_idx" ON "article_category_pivot"("article_category_id");

-- CreateIndex
CREATE INDEX "article_category_pivot_article_id_idx" ON "article_category_pivot"("article_id");

-- CreateIndex
CREATE INDEX "article_comments_article_id_idx" ON "article_comments"("article_id");

-- CreateIndex
CREATE INDEX "article_comments_parent_id_idx" ON "article_comments"("parent_id");

-- CreateIndex
CREATE INDEX "article_tag_pivot_article_id_idx" ON "article_tag_pivot"("article_id");

-- CreateIndex
CREATE INDEX "article_tag_pivot_article_tag_id_idx" ON "article_tag_pivot"("article_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_tags_slug_key" ON "article_tags"("slug");

-- CreateIndex
CREATE INDEX "article_visitors_article_id_idx" ON "article_visitors"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_writer_id_idx" ON "articles"("writer_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_slug_key" ON "course_categories"("slug");

-- CreateIndex
CREATE INDEX "course_category_pivot_course_category_id_idx" ON "course_category_pivot"("course_category_id");

-- CreateIndex
CREATE INDEX "course_reviews_course_id_idx" ON "course_reviews"("course_id");

-- CreateIndex
CREATE INDEX "course_reviews_student_id_idx" ON "course_reviews"("student_id");

-- CreateIndex
CREATE INDEX "course_student_groups_course_type_id_idx" ON "course_student_groups"("course_type_id");

-- CreateIndex
CREATE INDEX "course_student_groups_mentor_id_idx" ON "course_student_groups"("mentor_id");

-- CreateIndex
CREATE INDEX "course_students_course_student_group_id_idx" ON "course_students"("course_student_group_id");

-- CreateIndex
CREATE INDEX "course_students_student_id_idx" ON "course_students"("student_id");

-- CreateIndex
CREATE INDEX "course_syllabus_course_id_idx" ON "course_syllabus"("course_id");

-- CreateIndex
CREATE INDEX "course_tool_pivot_tool_id_idx" ON "course_tool_pivot"("tool_id");

-- CreateIndex
CREATE INDEX "course_transactions_course_id_idx" ON "course_transactions"("course_id");

-- CreateIndex
CREATE INDEX "course_transactions_student_id_idx" ON "course_transactions"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_types_slug_key" ON "course_types"("slug");

-- CreateIndex
CREATE INDEX "course_types_course_id_idx" ON "course_types"("course_id");

-- CreateIndex
CREATE INDEX "courses_mentor_id_idx" ON "courses"("mentor_id");

-- CreateIndex
CREATE INDEX "event_registrants_event_id_idx" ON "event_registrants"("event_id");

-- CreateIndex
CREATE INDEX "event_registrants_student_id_idx" ON "event_registrants"("student_id");

-- CreateIndex
CREATE INDEX "event_reviews_event_id_idx" ON "event_reviews"("event_id");

-- CreateIndex
CREATE INDEX "event_reviews_student_id_idx" ON "event_reviews"("student_id");

-- CreateIndex
CREATE INDEX "events_mentor_id_idx" ON "events"("mentor_id");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_key" ON "failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "faqs_faq_category_id_idx" ON "faqs"("faq_category_id");

-- CreateIndex
CREATE INDEX "jobs_queue_idx" ON "jobs"("queue");

-- CreateIndex
CREATE INDEX "mentor_earnings_course_id_idx" ON "mentor_earnings"("course_id");

-- CreateIndex
CREATE INDEX "mentor_earnings_event_id_idx" ON "mentor_earnings"("event_id");

-- CreateIndex
CREATE INDEX "mentor_earnings_mentor_id_idx" ON "mentor_earnings"("mentor_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentors_username_key" ON "mentors"("username");

-- CreateIndex
CREATE INDEX "mentors_user_id_idx" ON "mentors"("user_id");

-- CreateIndex
CREATE INDEX "password_resets_email_idx" ON "password_resets"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_key" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_idx" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_username_key" ON "students"("username");

-- CreateIndex
CREATE INDEX "students_user_id_idx" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "writers_username_key" ON "writers"("username");

-- CreateIndex
CREATE INDEX "writers_user_id_idx" ON "writers"("user_id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_category_pivot" ADD CONSTRAINT "article_category_pivot_article_category_id_fkey" FOREIGN KEY ("article_category_id") REFERENCES "article_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_category_pivot" ADD CONSTRAINT "article_category_pivot_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "article_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_pivot" ADD CONSTRAINT "article_tag_pivot_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_pivot" ADD CONSTRAINT "article_tag_pivot_article_tag_id_fkey" FOREIGN KEY ("article_tag_id") REFERENCES "article_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_visitors" ADD CONSTRAINT "article_visitors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "writers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_category_pivot" ADD CONSTRAINT "course_category_pivot_course_category_id_fkey" FOREIGN KEY ("course_category_id") REFERENCES "course_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_category_pivot" ADD CONSTRAINT "course_category_pivot_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_student_groups" ADD CONSTRAINT "course_student_groups_course_type_id_fkey" FOREIGN KEY ("course_type_id") REFERENCES "course_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_student_groups" ADD CONSTRAINT "course_student_groups_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_course_student_group_id_fkey" FOREIGN KEY ("course_student_group_id") REFERENCES "course_student_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_syllabus" ADD CONSTRAINT "course_syllabus_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tool_pivot" ADD CONSTRAINT "course_tool_pivot_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tool_pivot" ADD CONSTRAINT "course_tool_pivot_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_transactions" ADD CONSTRAINT "course_transactions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_transactions" ADD CONSTRAINT "course_transactions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_types" ADD CONSTRAINT "course_types_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrants" ADD CONSTRAINT "event_registrants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrants" ADD CONSTRAINT "event_registrants_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_faq_category_id_fkey" FOREIGN KEY ("faq_category_id") REFERENCES "faq_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_earnings" ADD CONSTRAINT "mentor_earnings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_earnings" ADD CONSTRAINT "mentor_earnings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_earnings" ADD CONSTRAINT "mentor_earnings_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writers" ADD CONSTRAINT "writers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
