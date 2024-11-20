import type { Context } from "../context.ts";
import { parse } from "jsr:@valibot/valibot@0.42.1";
import { ResultAsync } from "npm:neverthrow@7.2.0";
import { join } from "jsr:@std/url@1.0.0-rc.3";
import { convertError } from "../error.ts";
import { type Response_, responseSchema } from "./type.ts";

/**
 * Fetch list of issue templates
 * @params context Connection context object
 * @params projectId Project id or Project identifier
 */
async function throwableList(
  context: Context,
  projectId: number | string,
): Promise<Response_> {
  const endpoint = join(
    context.endpoint,
    "projects",
    `${projectId}`,
    "issue_templates.json",
  );
  const r = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  return parse(responseSchema, await r.json());
}

/**
 * Fetch list of issue templates
 * @params context Connection context object
 * @params projectId Project id or Project identifier
 */
export const list = ResultAsync.fromThrowable(
  throwableList,
  convertError("Unexpected Error"),
);
