import type { Geo } from "@vercel/functions";

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export type DocumentStatus = "processing" | "ready" | "failed";

export type DocumentInfo = {
  id: string;
  fileName: string;
  status: DocumentStatus;
  createdAt: Date;
};

export type DocsStatusResult = {
  hasDocuments: boolean;
  documents: DocumentInfo[];
  readyCount: number;
  processingCount: number;
  failedCount: number;
};

export type PromptContext = {
  requestHints: RequestHints;
};
