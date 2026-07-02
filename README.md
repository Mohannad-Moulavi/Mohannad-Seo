# Mohannad SEO - Vercel + ArvanCloud AI Gateway

This version uses ArvanCloud AIaaS Gateway instead of the direct Google Gemini API.

## Required Vercel Environment Variables

Set these in Vercel → Settings → Environment Variables:

- `ARVAN_AI_GATEWAY_URL` = your ArvanCloud AI Gateway endpoint URL ending in `/v1`
- `ARVAN_API_KEY` = your ArvanCloud machine-user API key. You can paste either `apikey xxxxx` or only `xxxxx`; the code normalizes it.

## Optional

- `ARVAN_AI_MODEL` = `Gemini-2.5-Flash` by default. Change only if your endpoint/model name differs.

After changing environment variables, redeploy the project in Vercel.

Security note: never put the Gateway URL or API key directly in source code or GitHub.
