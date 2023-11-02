import { object, safeParse } from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import { ShowIssue, showIssueSchema } from "./type.ts";
import type { Context } from "../context.ts";

const schema = object({
  issue: showIssueSchema,
});

type Include =
  | "children"
  | "attachments"
  | "relations"
  | "changesets"
  | "journals"
  | "watchers"
  | "allowed_statuses";

export async function show(
  id: number,
  context: Context,
  includes?: Include[],
): Promise<Result<ShowIssue, Error>> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
  if (includes !== undefined) {
    url.search = new URLSearchParams({ include: includes.join(",") })
      .toString();
  }
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
  return ok(parsed.output.issue);
}
