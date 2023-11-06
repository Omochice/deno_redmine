import { object, safeParse } from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import { type Project, projectSchema } from "./type.ts";
import type { Context } from "../context.ts";

const schema = object({
  project: projectSchema,
});

/**
 * Show the project of given ID.
 *
 * @param id Project ID
 * @param context Context for connecting Redmine
 * @return Result type Project or Error
 * @example
 * ```ts
 * const context = {
 *   endpoint: "your-redmine-endpoint",
 *   apiKey: "your-api-key",
 * }
 *
 * const result = await show(1, context) // existing project id
 * // Ok({ id: 1, name: "...", ... })
 *
 * const result2 = await show(2, context) // non-existing project id
 * // Err(...)
 * ```
 */
export async function show(
  id: number,
  context: Context,
): Promise<Result<Project, Error>> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  if (!response.ok) {
    return err(new Error(`${response.status}: ${response.statusText}`));
  }
  const json = await response.json();
  const parsed = safeParse(schema, json);
  if (!parsed.success) {
    return err(
      new Error("Fetched project has invalid schema", { cause: parsed.issues }),
    );
  }
  return ok(parsed.output.project);
}
