# Indie City Radio

## Current State
- Episode upload fails with "Failed to save episode" because `_initializeAccessControlWithSecret` is still called in `useActor.ts`, crashing the actor before `createEpisode` can run.
- `EpisodeInput` is missing the `explicit` field in the backend type, IDL JS factory, IDL d.ts declarations, and backend-augment.d.ts.
- The audio upload reads the entire file into a single `Uint8Array` via `file.arrayBuffer()` before chunking, which crashes or times out on 50-200MB files.
- The RSS feed does not emit an `<itunes:explicit>` tag.

## Requested Changes (Diff)

### Add
- `explicit: Bool` field to `Episode` and `EpisodeInput` types in `main.mo`
- `explicit: boolean` field to `EpisodeInput` and `Episode` in `backend.did.d.ts` and `backend.did.js`
- `explicit: boolean` field to `EpisodeInput` in `backend-augment.d.ts`
- `<itunes:explicit>` tag (yes/no) to the RSS feed per-item output in `main.mo`
- Explicit flag toggle (checkbox/switch) in the `EpisodeFormDialog` in `AdminPage.tsx`
- Streaming chunked reads in `StorageClient.putFile` to avoid loading entire 50-200MB file into memory at once

### Modify
- `useActor.ts`: remove `_initializeAccessControlWithSecret` call permanently
- `AdminPage.tsx`: add `explicit` field to `EpisodeFormData`, `EMPTY_FORM`, `handleSubmit`, and the edit dialog initial values
- `main.mo`: `createEpisode` and `updateEpisode` to include `explicit` field
- `StorageClient.ts`: `putFile` and `processFileForUpload` to use streaming chunk reads instead of full `arrayBuffer()` load

### Remove
- Nothing

## Implementation Plan
1. Fix `useActor.ts` -- remove `_initializeAccessControlWithSecret` call
2. Update `main.mo` -- add `explicit` to `Episode`, `EpisodeInput`, `createEpisode`, `updateEpisode`, and RSS output
3. Update `backend.did.js` and `backend.did.d.ts` -- add `explicit` field to both IDL types
4. Update `backend-augment.d.ts` -- add `explicit` to `EpisodeInput`
5. Update `StorageClient.ts` -- fix `processFileForUpload` to chunk-read the file via `blob.slice()` without loading the whole file into memory first
6. Update `AdminPage.tsx` -- add `explicit` field and toggle to the episode form
