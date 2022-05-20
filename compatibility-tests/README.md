# Compatibility tests

> The compatibility tests are a work in progress and not yet documented.

Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...) to build them in the CI
(these are the _compatibility tests_).

> **Gotchas**
> Some bundlers like webpack are not configured to work well with yarn workspaces by default. For example, the webpack config of create-react-app, tries to look up the node_modules chain to find missing dependencies, which is not a behavior that we want in build-tests setups. So if a setup doesn't work, try running it outside the monorepo to see if being in the monorepo is what's causing it to fail.

Feel free to check out [the existing setups](#the-currently-tested-setups) in
`compatibility-tests` if you get stuck.
