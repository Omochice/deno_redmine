import {
  nullable,
  number,
  object,
  type Output,
  string,
} from "jsr:@valibot/valibot@0.30.0";

export const trackerSchema = object({
  id: number(),
  name: string(),
  default_status: object({
    id: number(),
    name: string(),
  }),
  description: nullable(string()),
});

export type Tracker = Output<typeof trackerSchema>;
