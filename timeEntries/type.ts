import {
  date,
  type Input,
  is,
  maxLength,
  number,
  object,
  optional,
  type Output,
  string,
  transform,
  union,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

const idName = object({
  id: number(),
  name: string(),
});

export const timeEntry = transform(
  object({
    id: number(),
    project: idName,
    issue: object({ id: number() }),
    user: idName,
    activity: idName,
    hours: number(),
    comments: string(),
    spent_on: string(),
    created_on: string(),
    updated_on: string(),
  }),
  (input) => {
    return {
      ...input,
      spent_on: new Date(input.spent_on),
      created_on: new Date(input.created_on),
      updated_on: new Date(input.updated_on),
    };
  },
);

export type TimeEntry = Output<typeof timeEntry>;

export type InputTimeEntry = ({ issueId: number } | { project_id: number }) & {
  spentOn?: Date;
  hours: number;
  activityId?: number;
  comments: string;
  userId: number;
};

const updateIssueTimeEntrySchema = object({
  issueId: number(),
  spentOn: optional(date()),
  hours: number(),
  activityId: optional(number()),
  comments: optional(string([maxLength(255)])),
  userId: optional(number()),
});

const updateProjectTimeEntrySchema = object({
  projectId: number(),
  spentOn: optional(date()),
  hours: number(),
  activityId: optional(number()),
  comments: optional(string([maxLength(255)])),
  userId: optional(number()),
});

const specifier = union([
  updateIssueTimeEntrySchema,
  updateProjectTimeEntrySchema,
]);

export const uploadTimeEntrySchema = transform(
  specifier,
  (input) => {
    if (is(updateIssueTimeEntrySchema, input)) {
      return {
        issue_id: input.issueId,
        spent_on: input.spentOn,
        hours: input.hours,
        activity_id: input.activityId,
        comments: input.comments,
        user_id: input.userId,
      };
    }
    return {
      project_id: input.projectId,
      spent_on: input.spentOn,
      hours: input.hours,
      activity_id: input.activityId,
      comments: input.comments,
      user_id: input.userId,
    };
  },
);

export type UploadTimeEntry = Input<typeof uploadTimeEntrySchema>;
