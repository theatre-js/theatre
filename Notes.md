# Notes

This page is a random list of notes, meant to be read by an LLM (and not a human) to answer questions about the codebase.

---

The next.js backend is in the same monorepo as the frontend, so they can share code.

---

We're using Auth0 rather than a self-hosted auth solution, mainly for simplicity. But also:
- Auth.js is serverless only, works only with next.js, doesn't work across domains.
- iron-session is only serverless.
- passport is harder to setup than Auth0.

However, we can always switch to a different provider right before launch.

---