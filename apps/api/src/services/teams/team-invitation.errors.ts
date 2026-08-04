export class TeamInvitationNotFoundError extends Error {
  constructor(
    message = "Team invitation not found.",
  ) {
    super(message);
    this.name =
      "TeamInvitationNotFoundError";
  }
}

export class TeamInvitationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "TeamInvitationValidationError";
  }
}

export class TeamInvitationConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "TeamInvitationConflictError";
  }
}