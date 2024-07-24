import {
  array,
  boolean,
  type Input,
  number,
  object,
  optional,
  type Output,
  parse,
  string,
  transform,
} from "jsr:@valibot/valibot@0.30.0";
import { join } from "jsr:@std/url@1.0.0-rc.2";
import { Context } from "../context.ts";
import { UnprocessableEntityError } from "../error.ts";
import { ResultAsync } from "npm:neverthrow@7.0.0";

const inputIssueSchema = object({
  projectId: number(),
  trackerId: number(),
  statusId: number(),
  priorityId: number(),
  subject: string(),
  description: optional(string()),
  categoryId: optional(number()),
  fixedVersionId: optional(number()),
  assignedToId: optional(number()),
  parentIssueId: optional(number()),
  watcherUserIds: optional(array(number())),
  isPriavte: optional(boolean()),
  estimatedHours: optional(number()),
  customFields: optional(array(object({}))),
});

function normalizeIssue(input: Output<typeof inputIssueSchema>) {
  return {
    project_id: input.projectId,
    tracker_id: input.trackerId,
    status_id: input.statusId,
    priprity_id: input.priorityId,
    subject: input.subject,
    description: input.description,
    category_id: input.categoryId,
    fixed_version_id: input.fixedVersionId,
    assigned_to_id: input.assignedToId,
    parent_issue_id: input.parentIssueId,
    watcher_user_ids: input.watcherUserIds,
    is_private: input.isPriavte,
    estimated_hours: input.estimatedHours,
    custom_fields: input.customFields,
  };
}

const issueSchema = transform(inputIssueSchema, normalizeIssue);
export type Issue = Input<typeof issueSchema>;

/**
 * Create issue
 *
 * @param context REST endpoint context
 * @return Promise of result-type
 */
export const createIssue = ResultAsync.fromThrowable(throwableCreateIssue);

async function throwableCreateIssue(context: Context, issue: Issue) {
  const url = join(context.endpoint, "issues.json");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify(parse(inputIssueSchema, issue)),
  });
  if (!response.ok) {
    throw new UnprocessableEntityError(response);
  }
}
