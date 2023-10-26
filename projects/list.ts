import {
  array,
  number,
  object,
  safeParse,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.204.0/path/mod.ts";
import { type Project, projectSchema } from "./type.ts";
import type { Context } from "../context.ts";

const responseSchema = object({
  projects: array(projectSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

/**
 * Fetch projects list
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has project or error
 */
export async function fetchList(
  context: Context,
): Promise<Result<Project[], Error>> {
  let currentOffset = 0;
  const limit = 25;
  const projects: Project[][] = [];
  while (true) {
    const endpoint = new URL(join(context.endpoint, "projects.json"));
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${currentOffset}`,
    }).toString();
    const response = await fetch(
      endpoint,
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

    const parsed = safeParse(responseSchema, json);
    if (!parsed.success) {
      return err(
        new Error("Fetched project has invalid schema", {
          cause: parsed.issues,
        }),
      );
    }

    projects.push(parsed.output.projects);

    currentOffset += limit;
    if (currentOffset >= json.total_count) {
      break;
    }
  }

  return ok(projects.flat());
}
