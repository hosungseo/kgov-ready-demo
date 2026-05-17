import { OPENCLI_ADAPTERS } from "@/lib/opencli-adapters";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function generateStaticParams() {
  return OPENCLI_ADAPTERS.map((adapter) => ({ id: adapter.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adapter = OPENCLI_ADAPTERS.find((item) => item.id === id);

  if (!adapter) {
    return Response.json(
      {
        error: "adapter_not_found",
        message: `No adapter found for id: ${id}`,
        available: OPENCLI_ADAPTERS.map((item) => item.id),
      },
      { status: 404 },
    );
  }

  return Response.json({
    name: adapter.name,
    id: adapter.id,
    adapter,
    agentInstruction: {
      discover: "/api/adapters",
      verifyFirst: adapter.commands.map((command) => command.smoke),
      useWhen:
        "Use this adapter before browser UI automation when the user asks for this public source or its data.",
      stopIf: [
        "smoke command returns no rows for a broad known query",
        "source_url is missing from output",
        "auth is env-key and required environment variable is unavailable",
      ],
    },
  });
}
