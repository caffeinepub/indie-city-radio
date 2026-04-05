# Indie City Radio

## Current State
- App has a home page with episode grid pulling from the backend canister
- Episode detail page at `/episode/$id` uses backend data
- Existing AudioPlayer component is inline (not persistent/global)
- Header has nav links: EPISODES (to `/`), RSS FEED (to `/rss`), ADMIN
- No dedicated `/episodes` page exists
- No persistent bottom audio player
- Backend episode storage remains for future music streaming use

## Requested Changes (Diff)

### Add
- `RssEpisode` TypeScript type for RSS-parsed episode data (guid, title, description, pubDate, duration, audioUrl, artworkUrl, showNotes)
- `useRssFeed` hook that fetches and parses XML from `https://media.rss.com/indie-city/feed.xml` using the browser's DOMParser
- `/episodes` page: Apple Podcasts-style list layout -- each episode is a row with artwork thumbnail on the left, title/date/short description on the right, and a play button
- `/episodes/:guid` detail page (using encoded guid as URL param): full-screen layout with large artwork, full title, full description, show notes, publish date, duration, and a play button
- `PlayerContext` (React context + provider) that holds the currently playing episode state and audio element reference -- persists across navigation
- `PersistentPlayer` component: fixed bottom bar that appears when an episode is playing. Shows episode thumbnail, title, progress bar (scrubable), play/pause, skip ±15s, and volume. Stays visible as user navigates between pages
- Wire `PersistentPlayer` into the root layout in `App.tsx` (outside `<Outlet />`)

### Modify
- `Header.tsx`: Change EPISODES nav link from `to="/"` to `to="/episodes"`
- `App.tsx`: Add `/episodes` route, `/episodes/$guid` route, wrap root with `PlayerProvider`, add `PersistentPlayer` to root layout, add padding-bottom to main content area to prevent overlap with fixed player
- `HomePage.tsx`: Keep hero section as-is. Change "Start Listening" button to navigate to `/episodes` instead of scrolling. Remove the backend episode grid section (or replace the "Latest Podcast Episodes" section with a link/teaser pointing to `/episodes`)

### Remove
- Backend episode grid from home page (the `usePublishedEpisodes` call and grid rendering) -- replaced by RSS feed on the Episodes page
- The `to="/"` EPISODES nav link (replaced with `to="/episodes"`)

## Implementation Plan
1. Create `src/hooks/useRssFeed.ts` -- fetches RSS XML from the external URL via fetch(), parses with DOMParser, extracts all episode fields into `RssEpisode[]`
2. Create `src/context/PlayerContext.tsx` -- context with `currentEpisode`, `isPlaying`, `play(episode)`, `pause()`, `audioRef` shared globally
3. Create `src/components/PersistentPlayer.tsx` -- fixed bottom bar using PlayerContext, with progress, controls, artwork, title
4. Create `src/pages/EpisodesPage.tsx` -- fetches RSS feed, renders Apple Podcasts-style list rows
5. Create `src/pages/RssEpisodeDetailPage.tsx` -- full-screen episode detail using RSS data, play button triggers PlayerContext
6. Update `App.tsx` -- add new routes, wrap with PlayerProvider, add PersistentPlayer in root layout, add pb-24 to main when player is active
7. Update `Header.tsx` -- EPISODES link points to `/episodes`
8. Update `HomePage.tsx` -- remove backend episode grid, update Start Listening to link to `/episodes`
