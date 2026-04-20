CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resourceId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024),
	"chunkIndex" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentResource" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"fileName" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" varchar(20) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_resourceId_DocumentResource_id_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."DocumentResource"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentResource" ADD CONSTRAINT "DocumentResource_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_idx" ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);
