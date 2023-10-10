import type { Context } from "../context.ts";
import {
  array,
  number,
  object,
  safeParse,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { join } from "https://deno.land/std@0.203.0/path/mod.ts";
import { type Issue, issueSchema } from "./type.ts";

const responseSchema = object({
  issues: array(issueSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

type Option = {
  limit: number;
  include: "attachment" | "relations";
  issueId: number[] | number;
  projectId: number;
  subprojectId: string;
  trackerId: number;
  statusId: "open" | "closed" | "*" | number;
  assignedToId: number | "me";
  parentId: string;
  customField: {
    id: number;
    value: string;
  }[];
};

function convertValue(
  value: string | string[] | number | number[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return (Array.isArray(value) ? value : [value]).map((v) => `${v}`).join(",");
}

function convertCustomFields(
  customFields: { id: number; value: string }[] | undefined,
): [string, string][] {
  return customFields?.map(({ id, value }) => [`cf_${id}`, value]) ?? [];
}

function convertOptionToObject(
  option: Partial<Option>,
): Record<string, string> {
  const entries = [
    ["include", convertValue(option.include)],
    ["issue_id", convertValue(option.issueId)],
    ["project_id", convertValue(option.projectId)],
    ["subproject_id", convertValue(option.subprojectId)],
    ["trakcer_id", convertValue(option.trackerId)],
    ["status_id", convertValue(option.statusId)],
    ["assigned_to_id", convertValue(option.assignedToId)],
    ["parent_id", convertValue(option.parentId)],
    ...convertCustomFields(option.customField),
  ].filter(([_, value]) => value !== undefined);
  return Object.fromEntries(entries);
}

export async function listIssues(
  context: Context,
  option: Partial<Option> = {},
): Promise<Result<Issue[], Error>> {
  let currentOffset = 0;
  const limit = 100;
  const endpoint = new URL(join(context.endpoint, "issues.json"));

  const projects: Issue[][] = [];
  while (true) {
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${currentOffset}`,
      ...convertOptionToObject(option),
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
          cause: parsed.error,
        }),
      );
    }

    projects.push(parsed.output.issues);

    currentOffset += limit;
    if (
      currentOffset >= json.total_count ||
      currentOffset >= (option.limit ?? Infinity)
    ) {
      break;
    }
  }
  return ok(projects.flat());
}
