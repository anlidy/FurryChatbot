CREATE TABLE IF NOT EXISTS "CustomModel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"providerId" uuid NOT NULL,
	"modelId" varchar(200) NOT NULL,
	"displayName" varchar(200) NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CustomProvider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"baseUrl" text NOT NULL,
	"apiKey" text NOT NULL,
	"format" varchar DEFAULT 'openai' NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserProfile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"displayName" varchar(100),
	"avatarUrl" text,
	"preferences" json,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomModel" ADD CONSTRAINT "CustomModel_providerId_CustomProvider_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."CustomProvider"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomProvider" ADD CONSTRAINT "CustomProvider_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_id_User_id_fk" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
