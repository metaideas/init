/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as models_documents from "../models/documents.js";
import type * as private_users from "../private/users.js";
import type * as public_auth from "../public/auth.js";
import type * as public_documents from "../public/documents.js";
import type * as public_messages from "../public/messages.js";
import type * as shared_auth from "../shared/auth.js";
import type * as shared_convex from "../shared/convex.js";
import type * as shared_env from "../shared/env.js";
import type * as system_health from "../system/health.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  http: typeof http;
  "models/documents": typeof models_documents;
  "private/users": typeof private_users;
  "public/auth": typeof public_auth;
  "public/documents": typeof public_documents;
  "public/messages": typeof public_messages;
  "shared/auth": typeof shared_auth;
  "shared/convex": typeof shared_convex;
  "shared/env": typeof shared_env;
  "system/health": typeof system_health;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: import("#functions/components/better-auth/_generated/component.js").ComponentApi<"auth">;
};
