## What does this PR do? :thought_balloon:

Adds Mixpanel analytics tracking :bar_chart:

## Where should the reviewer start? :round_pushpin:

1. `server/server.js
2. `server/routes/call.js`

## How can this be tested? 🧪

- Add new environment variables
- Start the project with `yarn dev`
- Log `req.body` at the top of the `/api/index` endpoint in `server/routes/call.js`
- Do a test call
- Check that the `CallSid` in Mixpanel matches the `CallSid` in the console log
- Repeat a similar process for each of the new events being tracked in Mixpanel

## Any new environment variables for this? (Dev environment only!) :closed_lock_with_key:

```
export MIXPANEL_API_SECRET="shh"
```

## Any context to provide here? :thinking:

We need to track what our users are doing

## Any other important things to note about this? :memo:

This code has a few potential bugs (particularly in error handling), but nothing that would crash the server
