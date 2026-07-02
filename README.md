# Mohannad SEO - Vercel + ArvanCloud AI Gateway

This version uses an OpenAI-compatible AI Gateway URL instead of a direct Google Gemini API key.

## Vercel Environment Variables

Set this variable in Vercel:

- `ARVAN_AI_GATEWAY_URL` = your full ArvanCloud AI Gateway URL ending in `/v1`

Optional variables:

- `ARVAN_AI_MODEL` = `Gemini-2.5-Flash` (default)
- `ARVAN_AI_GATEWAY_TOKEN` = only if your gateway gives you a separate Bearer token

After changing environment variables, redeploy the project.
