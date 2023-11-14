import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.1.0";
import { parse } from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { join } from "https://deno.land/std@0.205.0/url/join.ts";
import type { Context } from "../context.ts";
import { UploadTimeEntry, uploadTimeEntrySchema } from "./type.ts";
import { convertError } from "../error.ts";

export function update(
  timeEntry: UploadTimeEntry,
  context: Context,
): ResultAsync<undefined, Error> {
  const entry = parse(uploadTimeEntrySchema, timeEntry);
  return ResultAsync.fromPromise(
    fetch(join(context.endpoint, "time_entries.json"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ time_entry: entry }),
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) => r.ok ? okAsync(undefined) : errAsync(r))
    .orElse((e: Response | Error) => {
      if (e instanceof Error) {
        return errAsync(e);
      }
      return errAsync(new Error(`Error: ${e.status}`, { cause: e }));
    });
}
