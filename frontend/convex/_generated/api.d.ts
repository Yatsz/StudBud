/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as app_ConvexClientProvider from "../app/ConvexClientProvider.js";
import type * as app_layout from "../app/layout.js";
import type * as app_page from "../app/page.js";
import type * as studentsData from "../studentsData.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "app/ConvexClientProvider": typeof app_ConvexClientProvider;
  "app/layout": typeof app_layout;
  "app/page": typeof app_page;
  studentsData: typeof studentsData;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
