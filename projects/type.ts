import {
  boolean,
  nullish,
  number,
  object,
  type Output,
  string,
  transform,
} from "https://deno.land/x/valibot@v0.18.0/mod.ts";

const inputProjectSchema = object({
  id: number(),
  name: string(),
  identifier: string(),
  description: nullish(string()),
  homepage: nullish(string()),
  status: number(),
  is_public: nullish(boolean()),
  inherit_members: boolean(),
  enable_new_ticket_message: nullish(number()),
  new_ticket_message: nullish(string()),
  default_version: nullish(object({
    id: number(),
    name: string(),
  })),
  created_on: string(),
  updated_on: string(),
  parent: nullish(object({
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
