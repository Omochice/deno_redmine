import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { join } from "https://deno.land/std@0.204.0/path/mod.ts";
import type { Context } from "../context.ts";
import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import type { ProjectRequest } from "./type.ts";

const errorSchema = object({
  errors: array(string()),
});

export async function create(
  project: ProjectRequest,
  context: Context,
): Promise<Result<void, Error>> {
  const url = new URL(join(context.endpoint, "projects.json"));
  const response = await fetch(
    url,
    {
      method: "POST",
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
