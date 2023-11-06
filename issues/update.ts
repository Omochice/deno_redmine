import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { Context } from "../context.ts";
import { Issue } from "./type.ts";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

type UpdateOption = {
  notes?: string;
  private_notes?: boolean;
};

const errorSchema = object({
  errors: array(string()),
});

export async function update(
  id: number,
  issue: Partial<Issue & UpdateOption>,
  context: Context,
): Promise<Result<void, Error>> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
  const response = await fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ issue }),
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
