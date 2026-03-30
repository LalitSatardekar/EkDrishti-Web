# Making a Case Fully 9:16 (Portrait)

Use this checklist whenever a production case (or any case with video assets) needs to be treated as vertical-first without touching layout code.

## 1. Update Case Metadata (`src/data/cases.js`)

1. Locate the case object.
2. Add `aspectRatio: '9/16'` alongside the other top-level fields.
3. If the case uses `videos: []`, make sure every item explicitly sets `aspectRatio: '9/16'`:

```js
videos: [
  {
    src: asset('Production', 'Example/Videos', 'clip.mp4'),
    poster: asset('Production', 'Example/Photos', 'clip_poster.jpg'),
    aspectRatio: '9/16',
  },
]
```

4. If the case uses a single `video` string (no array) just setting the project-level `aspectRatio` is enough—`WorkDetail` picks it up automatically.

## 2. Posters & Thumbnails

- Point `videoPoster`, `thumbnail169`, and/or `thumbnail32` at portrait-friendly images. The Work listing prefers `thumbnail169` for wide cards and `thumbnail32` for square-ish cards, so providing both keeps the masonry grid tidy.
- If you only have one hero image, reuse it for all thumbnail slots—it will still render correctly because `CachedImage` + `object-contain` prevent stretching.

## 3. Asset Checks (especially for S3 uploads)

- Confirm the actual video file is exported in 9:16. The player still respects `aspectRatio`, but giving it a true portrait file avoids letterboxing.
- Ensure S3 objects have public-read access and CORS rules that allow `GET` from your domain so the Cache API can fetch and store them.

## 4. Verification

1. Run `npm run dev` (or `pnpm/vite dev`) and open `/work/<slug>`.
2. The video container should now appear portrait with no cropping, and posters should match.
3. Spot-check the `/work` listing to confirm the card thumbnail looks correct.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Video still shows landscape | Double-check file orientation or metadata – re-export portrait if needed. |
| Poster looks squished | Provide a taller poster image or remove `object-cover` classes in the specific component if custom styling is required. |
| S3 asset doesn’t load | Verify the S3 URL, bucket policy, and CORS; look at the console for 403/404 errors. |

Following these steps keeps everything in sync with the existing `WorkDetail` logic while avoiding code changes elsewhere.
