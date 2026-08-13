import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import {
  normalizeInvitationUsername,
  resolveInvitationTargetInput,
} from "../teams/team-invitation-target.service";


// Command to run this test file:
// npx tsx --test apps/api/src/services/__tests__/team-invitation-target.test.ts
describe(
  "Team invitation target resolution",
  () => {
    it(
      "accepts an exact GitHub username",
      () => {
        const result =
          resolveInvitationTargetInput({
            username: "DevRajah",
          });

        assert.deepEqual(
          result,
          {
            type: "USERNAME",
            username: "DevRajah",
          },
        );
      },
    );

    it(
      "preserves username casing for database lookup",
      () => {
        const result =
          resolveInvitationTargetInput({
            username: "devrajah",
          });

        assert.deepEqual(
          result,
          {
            type: "USERNAME",
            username: "devrajah",
          },
        );
      },
    );

    it(
      "removes one optional leading @",
      () => {
        const result =
          resolveInvitationTargetInput({
            username: "@DevRajah",
          });

        assert.deepEqual(
          result,
          {
            type: "USERNAME",
            username: "DevRajah",
          },
        );
      },
    );

    it(
      "trims surrounding whitespace",
      () => {
        const result =
          resolveInvitationTargetInput({
            username:
              "   @DevRajah   ",
          });

        assert.deepEqual(
          result,
          {
            type: "USERNAME",
            username: "DevRajah",
          },
        );
      },
    );

    it(
      "retains legacy inviteeUserId compatibility",
      () => {
        const result =
          resolveInvitationTargetInput({
            inviteeUserId:
              "  user-123  ",
          });

        assert.deepEqual(
          result,
          {
            type: "USER_ID",
            inviteeUserId:
              "user-123",
          },
        );
      },
    );

    it(
      "rejects username and inviteeUserId together",
      () => {
        assert.throws(
          () =>
            resolveInvitationTargetInput({
              username: "DevRajah",
              inviteeUserId:
                "user-123",
            }),
          {
            message:
              "Provide either username or inviteeUserId, not both.",
          },
        );
      },
    );

    it(
      "rejects requests without either identifier",
      () => {
        assert.throws(
          () =>
            resolveInvitationTargetInput(
              {},
            ),
          {
            message:
              "A GitHub username is required.",
          },
        );
      },
    );

    it(
      "rejects whitespace-only identifiers",
      () => {
        assert.throws(
          () =>
            resolveInvitationTargetInput({
              username: "   ",
            }),
          {
            message:
              "A GitHub username is required.",
          },
        );
      },
    );

    it(
      "normalizes username deterministically",
      () => {
        const first =
          normalizeInvitationUsername(
            "  @DevRajah ",
          );

        const second =
          normalizeInvitationUsername(
            "  @DevRajah ",
          );

        assert.equal(
          first,
          "DevRajah",
        );

        assert.equal(
          first,
          second,
        );
      },
    );

    it(
      "does not lowercase canonical username input",
      () => {
        assert.equal(
          normalizeInvitationUsername(
            "@DevRajah",
          ),
          "DevRajah",
        );
      },
    );
  },
);