import {
  TeamInvitationValidationError,
} from "./team-invitation.errors";

/**
 * The invitation API temporarily accepts either:
 *
 * - GitHub username, preferred for user-facing flows
 * - ArcHive user ID, legacy compatibility only
 *
 * Future me:
 * Do not make both identifiers silently coexist.
 * Exactly one target identifier must be supplied.
 */
export type TeamInvitationTargetInput = {
  username?: unknown;
  inviteeUserId?: unknown;
};

export type ResolvedInvitationTarget =
  | {
      type: "USERNAME";
      username: string;
    }
  | {
      type: "USER_ID";
      inviteeUserId: string;
    };

/**
 * Normalize GitHub username input for LOOKUP only.
 *
 * We deliberately preserve the user's casing here.
 * The database performs case-insensitive matching.
 *
 * Examples:
 *
 * "DevRajah"       -> "DevRajah"
 * "devrajah"       -> "devrajah"
 * "@DevRajah"      -> "DevRajah"
 * "   @DevRajah "  -> "DevRajah"
 */
export const normalizeInvitationUsername = (
  username: string,
): string => {
  return username
    .trim()
    .replace(/^@/, "")
    .trim();
};

/**
 * Validate the external invitation target contract.
 *
 * This function contains no database logic, so it can be tested without
 * booting Prisma or touching development data.
 */
export const resolveInvitationTargetInput = (
  input: TeamInvitationTargetInput,
): ResolvedInvitationTarget => {
  const rawUsername =
    typeof input.username === "string"
      ? input.username
      : undefined;

  const rawInviteeUserId =
    typeof input.inviteeUserId === "string"
      ? input.inviteeUserId
      : undefined;

  const hasUsername =
    Boolean(rawUsername?.trim());

  const hasInviteeUserId =
    Boolean(rawInviteeUserId?.trim());

  if (
    hasUsername &&
    hasInviteeUserId
  ) {
    throw new TeamInvitationValidationError(
      "Provide either username or inviteeUserId, not both.",
    );
  }

  if (
    !hasUsername &&
    !hasInviteeUserId
  ) {
    throw new TeamInvitationValidationError(
      "A GitHub username is required.",
    );
  }

  if (hasUsername) {
    const username =
      normalizeInvitationUsername(
        rawUsername!,
      );

    if (!username) {
      throw new TeamInvitationValidationError(
        "A valid GitHub username is required.",
      );
    }

    return {
      type: "USERNAME",
      username,
    };
  }

  return {
    type: "USER_ID",
    inviteeUserId:
      rawInviteeUserId!.trim(),
  };
};