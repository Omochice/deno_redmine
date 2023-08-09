import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { join } from "https://deno.land/std@0.197.0/path/mod.ts";
import type { Context } from "../context.ts";
import { $array, $object, $string } from "npm:lizod@0.2.6";

type Project = {
  name: string;
  /** need match /[a-zA-Z0-9\-_]{1,100} */
  identifier: string;
  description?: string;
  homepage?: string;
  is_public?: boolean;
  parent_id?: number;
  inherit_members?: boolean;
  default_assigned_to_id?: number;
  default_version_id?: string;
  tracker_ids?: number[];
  enable_module_names?: string[];
  issue_custom_field_ids?: string[];
  custom_field_values?: Record<string, string>;
};

export async function create(
  project: Project,
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
    if (!$object({ errors: $array($string) })(json)) {
      return err(new Error(`${response.status}: ${response.statusText}`));
    }
    return err(new Error(JSON.stringify(json.errors)));
  }
  return ok(undefined);
}
