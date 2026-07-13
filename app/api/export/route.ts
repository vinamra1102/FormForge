import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { toEmbedCode, toJSONSchema, toReactCode } from "@/lib/export";
import { rateLimit } from "@/lib/rate-limit";
import { formSchema } from "@/lib/schema";

const bodySchema = z.object({
  schema: formSchema,
  format: z.enum(["json", "react", "embed"]),
});

/**
 * POST /api/export
 * Body:    { schema: FormSchema, format: "json" | "react" | "embed" }
 * Returns: { output: string }
 * Rate limited to 20 requests/minute per IP.
 */
export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown")
    .split(",")[0]!
    .trim();

  const limit = rateLimit(`export:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded — max 20 requests per minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const { schema, format } = parsed.data;
  const output =
    format === "json"
      ? toJSONSchema(schema)
      : format === "react"
        ? toReactCode(schema)
        : toEmbedCode(schema);

  return NextResponse.json({ output });
}
