## Goal

Restructure the flow so that after language selection, the user sees an "avatar blur loop video" with **5 product buttons** overlaid on top. Tapping a product plays its intro video, after which **3 sub-product buttons** (Ultra / Pro / Base) appear. Everything (button labels, target nodes, all video uploads) is editable per-language via the dashboard.

## New flow

```text
Language Select
      │
      ▼
[Product Picker Screen]   ← loop video + 5 buttons (no main video, buttons visible immediately)
      │
      ├─ Galaxy Book 6 Series ──► Intro video ──► [Ultra] [Pro] [Base]
      ├─ Galaxy S26            ──► Intro video ──► [Ultra] [Pro] [Base]
      ├─ Galaxy S25            ──► Intro video ──► [Ultra] [Pro] [Base]
      ├─ Galaxy Watch 8        ──► Intro video ──► [Ultra] [Pro] [Base]
      └─ Galaxy Tab S10        ──► Intro video ──► [Ultra] [Pro] [Base]
```

## Master node structure (replaces current MASTER_NODES)

A single `product-picker` node (loop video only, holds the 5 product buttons), then per-product an intro node + 3 variant leaf nodes.

| node_key | role | needs main video | needs loop video |
|---|---|---|---|
| `product-picker` | Initial avatar/blur screen with 5 buttons | no (optional) | yes |
| `galaxy-book-6-series` | Product intro | yes | yes |
| `galaxy-book-6-series-ultra` | Variant leaf | yes | optional |
| `galaxy-book-6-series-pro` | Variant leaf | yes | optional |
| `galaxy-book-6-series-base` | Variant leaf | yes | optional |
| `galaxy-s26` + `-ultra/-pro/-base` | same pattern | | |
| `galaxy-s25` + `-ultra/-pro/-base` | same pattern | | |
| `galaxy-watch-8` + `-ultra/-pro/-base` | same pattern | | |
| `galaxy-tab-s10` + `-ultra/-pro/-base` | same pattern | | |

Total: 1 picker + 5 intros + 15 variants = **21 nodes per language**.

## Default buttons (seeded per language)

- `product-picker` → 5 buttons targeting each product intro
- Each product intro → 3 buttons (`Ultra`, `Pro`, `Base`) targeting the corresponding variant leaf

All labels/targets/timestamps remain editable per language in the dashboard.

## Implementation

### 1. `src/pages/Dashboard.tsx`
- Replace `MASTER_NODES` with the 21-node list above.
- After auto-seeding videos for a language, also auto-seed default buttons for that language if none exist for `product-picker` and the 5 product intros (insert with `appear_at_seconds: 0` for picker buttons; `appear_at_seconds: 0` for variant buttons too — designer can edit).
- Update the section grouping in the dashboard:
  - **Product Picker** section: `product-picker` only
  - **Product Intros** section: 5 intro nodes
  - **Product Variants** section: 15 leaf nodes (grouped/labeled by product)
- Keep upload, remove, button-edit logic unchanged.

### 2. `src/pages/Index.tsx`
- After language select, set the current node to `product-picker` instead of `intro`.
- Pass the picker's loop video as `loopVideoSrc`. Since the picker has no main video, `VideoScreen` should treat it as "video already ended" so the 5 buttons appear immediately on top of the looping blur video.

### 3. `src/components/VideoScreen.tsx`
- Add support for a node that has **only a loop video, no main video**: when `videoSrc` is empty/null but `loopVideoSrc` exists, skip the main video entirely, show the loop video immediately (blurred + dark overlay), and reveal all buttons right away.
- Existing main→loop cross-fade behavior for nodes that have both videos stays the same.
- Cross-fade between consecutive screens (already keyed by `videoKeyRef`) stays the same.

### 4. Data migration
- Old node_keys (`intro`, `power-user`, `professional`, `everyday-essential`, `galaxy-s25-ultra`, etc.) are now stale.
- The dashboard auto-seeds the new nodes on first visit per language; old rows simply remain unused. No destructive migration needed — they won't appear in the new sections because grouping filters by the new node_keys.
- If you want them removed, we can add a one-time cleanup; otherwise leave them dormant.

## Notes / decisions to confirm

- **Picker main video**: I'll allow an optional main video on `product-picker` too (e.g. a short greeting before buttons appear). If absent, buttons show immediately over the loop. OK?
- **Auto-seed default buttons**: I'll seed the 5 picker buttons + the 3 variant buttons per product intro automatically on first dashboard visit per language. They remain fully editable.
- Old data (intro / categories / previous product nodes) will be left in the database but hidden from the new dashboard layout.
