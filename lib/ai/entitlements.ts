import type { UserType } from "@/app/(auth)/auth";

type Entitlements = {
  maxMessagesPerHour: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerHour: 1000,
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerHour: 1000,
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
