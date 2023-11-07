import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import type { Context } from "../context.ts";
import type { ProjectRequest } from "./type.ts";
import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

const errorSchema = object({
  errors: array(string()),
});

export type ProjectUpdateInformation = Partial<
  Omit<ProjectRequest, "identifier">
>;

/**
 * Update the project of given id
 *
 * @param id Project ID
 * @param project Schema to update
 * @param context Context for connecting Redmine
 * @return Result type void or Error
 * @example
 * ```ts
 * const context = {
 *   endpoint: "your-redmine-endpoint",
 *   apiKey: "your-api-key",
 * }
 *
 * const result = update(1, { name: "some update name" }, context)
 * // Ok(undefined)
 *
 * const result2 = update(2, { name: "some update name" }, context) // non-existing ID
 * // Err(Error("404: Not Found"))
 * ```
 */
export async function update(
  id: number,
  project: ProjectUpdateInformation,
  context: Context,
): Promise<Result<void, Error>> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  const response = await fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ project }),
    },
  );
  if (!response.ok) {
    const json = await response.json();
    if (!is(errorSchema, json)) {
      return err(new Error(`${response.status}: ${response.statusText}`));
    }
    return err(new Error(JSON.stringify(json.errors)));
  }
  return ok(undefined);
}
