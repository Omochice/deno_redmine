import { $array, $number, $object } from "npm:lizod@0.2.6";
import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { join } from "https://deno.land/std@0.197.0/path/mod.ts";
import { convertDate, type Project, validateProject } from "./type.ts";
import { makeValidateError } from "../error.ts";
import type { Context } from "../context.ts";

const validateResponse = $object({
  projects: $array(validateProject),
  total_count: $number,
  offset: $number,
  limit: $number,
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
  const projects = [];
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
    const ctx = { errors: [] };

    if (!validateResponse(json, ctx)) {
      return err(makeValidateError(json, ctx));
    }
    projects.push(json.projects);

    currentOffset += limit;
    if (currentOffset >= json.total_count) {
      break;
    }
  }
  return ok(projects.flat().map((p) => convertDate(p)));
}
