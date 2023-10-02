import {
  boolean,
  number,
  object,
  optional,
  type Output,
  string,
  transform,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

export const inputProjectSchema = object({
  id: number(),
  name: string(),
  identifier: string(),
  description: optional(string()),
  homepage: optional(string()),
  status: number(),
  is_public: optional(boolean()),
  inherit_members: boolean(),
  enable_new_ticket_message: optional(number()),
  new_ticket_message: optional(string()),
  default_version: optional(object({
    id: number(),
    name: string(),
  })),
  created_on: string(),
  updated_on: string(),
  parent: optional(object({
    id: number(),
    name: string(),
  })),
});

export const projectSchema = transform(inputProjectSchema, (input) => {
  return {
    ...input,
    created_on: new Date(input.created_on),
    updated_on: new Date(input.updated_on),
  };
});

export type Project = Output<typeof projectSchema>;
