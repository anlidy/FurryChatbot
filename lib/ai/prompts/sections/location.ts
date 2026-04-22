import type { RequestHints } from "../types";

export function buildLocationSection(requestHints: RequestHints): string {
  return `<location>
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
</location>`;
}
