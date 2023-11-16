import { show } from "./show.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.205.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.205.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

const sampleTimeEntry = {
  id: 1,
  project: { id: 1, name: "sample project name" },
  issue: { id: 2 },
  user: { id: 1, name: "sample redmine user" },
  activity: { id: 2, name: "normal" },
  hours: 0.5,
  comments: "sample comment",
  spent_on: "2023-11-14",
  created_on: "2023-11-14T05:33:42Z",
  updated_on: "2023-11-14T05:33:42Z",
} as const;

Deno.test("test for redmine time_entries 'show' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should return ok", async () => {
    mockFetch
      .intercept(join(context.endpoint, "time_entries", "1.json"), {
        method: "GET",
      })
      .response(JSON.stringify({ time_entry: sampleTimeEntry }), {
        status: 200,
      });
    const e = await show(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept(join(context.endpoint, "time_entries", "1.json"), {
          method: "GET",
        })
        .response(JSON.stringify(errorSample), {
          status: 422,
          statusText: "Unprocessable Entity",
        });
      const e = await show(1, context);
      assert(e.isErr());
    },
  );

  mockFetch.deactivate();
});
