import {
  array,
  boolean,
  type Input,
  merge,
  nullType,
  number,
  object,
  optional,
  type Output,
  string,
  transform,
  union,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

export type IdName = Output<typeof IdName>;
export const IdName = object({
  id: number(),
  name: string(),
});

export type IssueStatus = Output<typeof IssueStatus>;
export const IssueStatus = merge([
  IdName,
  object({
    is_closed: boolean(),
  }),
]);

const convertDate = (input: string | null | undefined): Date | undefined => {
  if (input == null) {
    return undefined;
  }
  const date = new Date(input);
  if (date.toString() === "Invalid Date") {
    return undefined;
  }
  return date;
};

const customFieldSchema = union([
  object({
    id: number(),
    name: string(),
    value: union([string(), nullType()]),
  }),
  object({
    id: number(),
    name: string(),
    multiple: boolean(),
    value: union([array(string()), nullType()]),
  }),
]);

const convertCustomField = (
  customField: Input<typeof customFieldSchema> | null | undefined,
) => {
  if (customField == null) {
    return undefined;
  }
  return {
    ...customField,
    value: customField.value == null ? undefined : customField.value,
  };
};

export const issueSchema = transform(
  object({
    id: number(),
    project: IdName,
    tracker: IdName,
    status: IssueStatus,
    priority: IdName,
    author: IdName,
    assigned_to: optional(union([IdName, nullType()])),
    category: optional(union([IdName, nullType()])),
    subject: string(),
    description: union([string(), nullType()]),
    start_date: union([string(), nullType()]),
    due_date: union([string(), nullType()]),
    done_ratio: number(),
    is_private: boolean(),
    estimated_hours: union([number(), nullType()]),
    total_estimated_hours: union([number(), nullType()]),
    spent_hours: number(),
    total_spent_hours: number(),
    created_on: string(),
    updated_on: string(),
    closed_on: union([string(), nullType()]),
    custom_fields: optional(array(customFieldSchema)),
  }),
  (input) => {
    return {
      ...input,
      assigned_to: input.assigned_to ?? undefined,
      category: input.category ?? undefined,
      description: input.description ?? undefined,
      start_date: convertDate(input.start_date ?? undefined),
      due_date: convertDate(input.due_date ?? undefined),
      estimated_hours: input.estimated_hours ?? undefined,
      total_estimated_hours: input.total_spent_hours ?? undefined,
      closed_on: convertDate(input.closed_on ?? undefined),
      custom_fields: input.custom_fields?.map(convertCustomField),
    };
  },
);

export type Issue = Output<typeof issueSchema>;
