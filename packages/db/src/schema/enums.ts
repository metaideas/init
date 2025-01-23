import { pgEnum } from "drizzle-orm/pg-core"

export const userRoles = pgEnum("user_role", ["user", "admin"])

export const organizationRoles = pgEnum("organization_role", [
  "member",
  "admin",
  "owner",
])

export const invitationStatus = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "canceled",
])

export const activityType = pgEnum("activity_type", [
  "accepted_invitation",
  "created_asset",
  "created_organization",
  "declined_invitation",
  "deleted_account",
  "invited_member",
  "marked_asset_as_uploaded",
  "marked_email_as_verified",
  "removed_member",
  "requested_email_verification",
  "requested_password_reset",
  "requested_sign_in_code",
  "reset_password",
  "signed_in_with_code",
  "signed_in_with_github",
  "signed_in_with_google",
  "signed_in_with_password",
  "signed_out",
  "signed_up_with_code",
  "signed_up_with_github",
  "signed_up_with_google",
  "signed_up_with_password",
])
