const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  // Demo-only OIDC discovery stub. Real OIDC endpoints are NOT implemented;
  // this document exists to demonstrate the well-known metadata convention.
  const doc = {
    issuer: SITE_URL,
    authorization_endpoint: `${SITE_URL}/oauth/authorize`,
    token_endpoint: `${SITE_URL}/oauth/token`,
    userinfo_endpoint: `${SITE_URL}/oauth/userinfo`,
    jwks_uri: `${SITE_URL}/.well-known/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "client_credentials"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email", "ministry.read"],
    token_endpoint_auth_methods_supported: ["client_secret_basic"],
    claims_supported: ["sub", "name", "email", "iat", "exp"],
    code_challenge_methods_supported: ["S256"],
    // Not implemented — demo only
    demo_note: "This is a placeholder OIDC discovery document for the kgov-ready-demo site.",
  };
  return new Response(JSON.stringify(doc, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
