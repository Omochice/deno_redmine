import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import type { Context } from "../context.ts";

const errorSchema = object({
  errors: array(string()),
});

async function internal(
  id: number,
  method: "archive" | "unarchive",
  context: Context,
): Promise<Result<void, Error>> {
  const url = new URL(
    join(context.endpoint, "projects", `${id}`, `${method}.json`),
  );
  const response = await fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
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

export async function archive(
  id: number,
  context: Context,
): Promise<Result<void, Error>> {
  return await internal(id, "archive", context);
}

export async function unarchive(
  id: number,
  context: Context,
): Promise<Result<void, Error>> {
  return await internal(id, "unarchive", context);
}
