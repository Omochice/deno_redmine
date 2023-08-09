import { $object } from "npm:lizod@0.2.6";
import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { join } from "https://deno.land/std@0.197.0/path/mod.ts";
import { convertDate, type Project, validateProject } from "./type.ts";
import { makeValidateError } from "../error.ts";
import type { Context } from "../context.ts";

const validateResult = $object({ project: validateProject });

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
  const ctx = { errors: [] };
  if (!validateResult(json, ctx)) {
    return err(makeValidateError(json, ctx));
  }

  return ok(convertDate(json.project));
}
