# Content Studio: engineering report and deployment guide

## Delivery status

The Blog CMS is implemented in the existing React/Vite, Express and MongoDB application. Local API/browser checks use a uniquely named temporary database, then remove it and their returned test uploads. No sample articles have been inserted into the production database.

**Production release gate remains open.** No deployment, public article, Google indexing, Search Console property access, IndexNow receipt or external-provider upload has been verified in production. A successful local build is not evidence of deployed crawlability. A real approved article must be published on the deployed runtime and checked with JavaScript disabled / an HTTP client before Phase 0 can be called production-ready.

## Architecture decisions

1. Keep the existing stack and Case CMS. Dedicated Blog models, route handlers and UI extend the owner panel at `/ownercontrols_panel`.
2. Use Tiptap 3 / ProseMirror (MIT open-source extensions), with JSON documents as canonical content. The editor is lazy-loaded for administrators; visitors do not download the editor bundle. No paid Tiptap extensions or cloud editor service are required. See the [React integration](https://tiptap.dev/docs/editor/getting-started/install/react).
3. Use one bounded, escaped JSON-to-HTML renderer for public React pages, private previews and initial server HTML. Article data is fetched from MongoDB on each request, not frozen at build time. Express replaces the generic index head/body with article-specific metadata, navigation, body, FAQs and a safe JSON bootstrap. React uses the bootstrap and the same presentation code. Vite's development middleware transforms backend HTML so direct local Blog requests also return content before JavaScript.
4. Public eligibility is `published && publishedAt <= now` or `scheduled && scheduledAt <= now`. Database timestamps remain authoritative through restarts. Elapsed schedules appear in the owner Published filter and use their scheduled date for recent-article ordering. No timer or background worker is required to make scheduled content public. Drafts, archived content and future schedules return 404 publicly.
5. Blog save + prior-version snapshot + notification outbox are one MongoDB transaction, with a version compare-and-set. **A transaction-capable replica set is required; MongoDB Atlas qualifies.** A standalone local MongoDB instance needs a replica-set configuration. Settings use their own version comparison.
6. Slugs and their aliases are covered by a unique multikey index. Old published paths redirect directly to the current eligible slug. Unpublishing makes current and old URLs unavailable. API conflicts return 409 and retain the editor's local recovery copy.
7. New articles snapshot typography/CTA defaults, preserving published appearance when settings change. Author details are snapshots too; profile routes require a genuine biography and eligible published content.

## Models

- `Blog`: document, schema version, current/previous slugs, search text, title/excerpt, categories/tags, authorship, image metadata, fonts, body/title typography, FAQs, SEO, CTA, topic cluster, sources/experience, publication timestamps, review date, editor and version.
- `BlogCategory`: stable slug, name, description, optional image, SEO fields, order, visibility. Initial business categories are defaults; owner overrides are merged without losing them. Empty categories are not exposed as indexable archives.
- `BlogSettings`: versioned singleton, landing copy, card/featured presentation, paging, categories visibility, publisher/social defaults, typography, author profiles and default CTA.
- `BlogRevision`: recoverable snapshots of successful previous saves. The UI lists the latest 100 versions with dates, titles, state and editor; all saved snapshots remain in the collection. Restoring records another recoverable version and preserves the current publication state and canonical route. Former slugs cannot be reused, preventing cached permanent-redirect loops.
- `BlogNotification`: durable, retryable IndexNow outbox with due timestamps. No Redis or external job queue was added.

## Routes

Public HTML: `/blogs`, `/blogs/:slug`, `/blogs/category/:slug`, `/blogs/author/:slug`.

Protected UI: `/ownercontrols_panel/blogs`, `/new`, `/:id`, `/settings`, `/insights` under that prefix. Backend authorization is required independently of React route guards.

Public APIs: `GET /v1/blogs`, `/v1/blogs/:slug`, `/v1/blog-categories`, `/v1/blog-settings`, `/v1/blog-page?path=...`.

Protected APIs: list/create/read/update/delete under `/v1/admin/blogs`; `/:id/publish`, `/unpublish`, `/duplicate`, `/revisions`, `/restore/:revision`; `GET/PUT /v1/admin/blog-settings`; category management; `/v1/admin/blog-import`; `/v1/admin/blog-insights`; `/v1/admin/blog-indexnow`. Existing `/api/v1` aliases are supported too. The notification worker is `POST /v1/blog-notifications/flush` with its separate server-side secret.

## Owner workflow

Create a draft → write → configure images/FAQ/SEO/CTA → private preview → publish or schedule.

The management dashboard supports search, state/category/author filters, sorting, paging, featured selection, independent duplication and deletion. Publish, unpublish, schedule, archive and restore are available in the editor.

Draft autosave is debounced, avoids overlapping writes, pauses on validation/concurrency/authentication errors, and backs off after transient failures. Published edits require an explicit save. A tab-scoped session-storage copy is retained for interrupted work; recovery is explicit and does not overwrite newer server records automatically. Reload/close warnings and link-navigation confirmation protect dirty documents. Browser-back navigation also retains the local recovery copy, but does not use a global router-blocker replacement.

Private preview is inside the authenticated editor, uses current unsaved data and actual article presentation, blocks outgoing navigation, and does not fire public article view/CTA analytics. It has no public share URL or preview token to leak or expire. Owner pages carry noindex metadata.

## Rich-text and media capabilities

- Paragraphs, H1–H6, quotes, code blocks, inline code, dividers, nested ordered/unordered/task lists and list indentation.
- Selected-text bold/italic/underline/strike, highlight, sub/superscript, colors, fonts, weight, size, spacing, line height, alignment, transform, shadows/stroke, clear formatting and copied typography templates. Semantic headings remain distinct from visual typography.
- Tables with rows/columns, header cells, alignment and responsive overflow handling.
- Undo/redo, keyboard shortcuts, sanitized paste/import, word/reading-time counts, selected-text finding and document recovery.
- Existing upload pipeline for inline/featured images and fonts. Existing compatible case media can be selected. Inline images support safe resizing, alignment, captions, alternative text, links, replacement through their URL/upload and removal; ProseMirror provides block dragging. Featured image has independent fit/focal/alt/caption controls. No base64 image documents are stored.
- Per-article FAQs with stable IDs, enabled state, rich answers, duplication, removal, reordering and native accessible disclosures. FAQ answers are in initial HTML even when collapsed. No FAQ rich-result promise or FAQ-specific schema is made.

## Search and security

Server responses include article title/body, author/date, links, images/alt, FAQs, unique metadata, canonical, BlogPosting and BreadcrumbList. Metadata and JSON-LD are escaped. React removes generic static head defaults to avoid duplicate descriptions/canonicals after client navigation. Missing pages use 404/noindex; database failure uses 503/noindex. Search results are noindex. Sitemaps preserve existing static and case-study entries and add eligible Blog URLs, excluding noindex articles. Development robots remain disallowed; production permits public Blogs and blocks owner/API areas.

Structured documents are restricted by node/mark grammar, depth/count, document size, safe URLs and style allowlists. Full save payloads are capped at 4 MB. Uploaded binaries remain in the existing upload system. HTML imports additionally pass a server sanitizer. Labels, metadata and body text cannot inject HTML. Custom font resources reject dangerous URL characters. Backend writes/import/preview data require admin/editor authentication; API responses are not cacheable. Every save checks the expected version.

Canonical host defaults to `https://www.ekdrishti.com`, matching the existing sitemap. Optionally set **both** `BLOG_PUBLIC_ORIGIN` and `VITE_BLOG_PUBLIC_ORIGIN` to the same approved www/non-www production origin, configure the corresponding domain redirect, and rebuild. Cross-origin canonicals are rejected.

## Phase status

### Phase 0: implemented; local tests pass; production gate unverified

Public pages and initial HTML, dedicated persistence, rich-text editor, optional media/FAQs, categories, metadata/schema/canonicals/redirects, sitemap/robots, durable publication scheduling, autosave/recovery, revisions, settings and API separation are implemented. Real public-host verification is still required.

### Phase 1: implemented local features; external integrations unverified

Explainable editorial checks, actual published internal references, topic-cluster related content, configurable service CTA, meaningful author profiles, original-experience/reference blocks and editorial review dates are implemented. CTA tracking uses existing analytics; `/contact` CTA links carry article UTM attribution into the existing contact schema. No conversion measurements are fabricated.

Search Console uses its [official query API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) for blog page/query metrics, clicks/impressions/CTR/position, daily data and prior-period comparisons when an access token and verified property are configured. Missing/expired credentials produce a disconnected state. OAuth acquisition and token refresh are operational responsibilities; there is no fake Connect flow or simulated data. The API returns available/top rows, not a guarantee of all Google data.

IndexNow uses a durable publication-change outbox and [the official protocol](https://www.indexnow.org/documentation). A configured owner can process it manually; production should invoke the authenticated worker periodically. The public verification key endpoint is `/indexnow-key.txt`. Successful HTTP receipt is not proof of indexing. No Google Indexing API is used for ordinary articles.

### Phase 2: planned, not implemented

After production publishing/search measurement is stable: content-gap and duplicate-topic analysis using the actual corpus; editorial calendar/review reminders; licensed keyword-provider integrations; optional approved AI editing; refresh recommendations; deeper link and conversion analysis; authorized AI-search visibility measurement. No automatic generated publishing, invented metrics, ranking guarantees or fabricated experience has been added.

## Verification and current results

Commands:

```powershell
npm.cmd run test:block-isolation
npm.cmd run test:media-system
npm.cmd run test:blog-cms
npm.cmd run test:blog-browser
npm.cmd run test:cms-browser
npm.cmd run build
npm.cmd run audit
```

Dedicated tests cover document/model validation, authorization, CRUD, scheduling across time boundaries, archived/draft privacy, collisions/redirect history, optimistic concurrency, transactional revisions, FAQ isolation, settings inheritance, pagination, HTML import sanitization/XSS, canonical policy, metadata/JSON-LD, sitemap/robots and initial HTML. Real Edge checks cover writing/headings and overlapping formatting, tables, existing-pipeline uploads/replacement, image metadata, FAQ editing/order, autosave, local recovery after reload, failed-save retention, private preview, publication, mobile/tablet/desktop layouts and JavaScript-disabled reading. The Vercel adapter original-path behavior was simulated locally; that is not a deployed-Vercel verification. The existing Case CMS browser suite also passed all 15 scenario groups with no runtime errors. The measured pure validation/render time for an 800-paragraph fixture was approximately 21–24 ms locally; the headless Edge load plus first interaction for that same 800-paragraph editor fixture measured about 4.4 seconds locally. These measurements are not performance guarantees.

The existing readiness audit reports 13 passed, 1 warning, 0 failed: SMTP still uses a placeholder, so actual email delivery is unverified. npm audit also reports **pre-existing dependency findings**: the committed baseline had 63 (including 2 critical); the updated tree has 60 (including the same 2 critical), with no newly flagged package names. Critical findings name `proxy-addr` and `tar`. They require separate dependency remediation before a production security sign-off; unrelated force upgrades were not applied.

## Production deployment requirements

1. Serve dynamic `/blogs*`, `/v1/*`, `/sitemap.xml`, `/robots.txt` and the optional verification/worker routes through the Node runtime. Build `dist` and run the existing `server.js`; it serves frontend assets and API together. Keep the process supervised and configure the reverse proxy to forward the original path. **FTP of `dist/` alone cannot deliver dynamic article HTML.** The existing FTP workflow has not been presented as an SEO-ready deployment.
2. A Vercel adapter and explicit dynamic rewrites are supplied. Verify function packaging, MongoDB connectivity, runtime limits, assets and direct article responses in that environment; this has not been deployed/tested on Vercel. Vercel needs S3 or other existing durable cloud media storage; local upload fallback is not durable/read-write hosting there.
3. Set production MongoDB Atlas and JWT credentials. Existing production database checks also require the legacy SMTP variables. Do not expose secrets through Vite variables. Configure actual SMTP credentials before relying on enquiry emails.
4. Configure cloud media and CORS as appropriate; real S3 upload/delivery has not been exercised by isolated local-upload tests.
5. For Search Console, configure `SEARCH_CONSOLE_SITE_URL` and a valid `SEARCH_CONSOLE_ACCESS_TOKEN` with the required verified-property access. Securely maintain token refresh outside this implementation.
6. For IndexNow, configure `INDEXNOW_KEY`, make the verification endpoint reachable on the canonical host, and configure `BLOG_WORKER_SECRET`. Invoke `POST /v1/blog-notifications/flush` with `Authorization: Bearer <worker secret>` from a trusted scheduler. Small batches retry durably; articles publish on time independently of this worker.
7. Publish approved real content, then fetch its public URL without JavaScript. Check status, body, exactly one canonical/description/title, BlogPosting/BreadcrumbList JSON-LD, redirects, noindex and sitemap inclusion. Recheck after an update and schedule boundary. Use production Search Console inspection/Rich Results tools only when authorized access is available.

## Files and scope

New runtime areas: `src/pages/Blogs.jsx`, four `src/pages/admin/AdminBlog*.jsx` pages, `src/components/admin/blog/*`, `src/components/blog/blog.css`, `src/api/blogApi.js`, `src/lib/blogContent.js`, `blogSEO.js`, `blogPresentation.js`, five `server_api/models/Blog*.js` models, `server_api/v1/blogs.js`, `server_api/lib/blog*.js`, and `api/index.js`.

Integration changes: App routes, existing Navbar active state (the approved uncommitted layout is preserved), Footer, AdminLayout, server entry point, sitemap/robots, Vite development rendering, Vercel configuration, package/lockfile, environment template and README. Existing Case runtime models/renderers/editor remain unchanged. The isolated test helper only exposes its existing Express app to additional Blog tests. No automatic commit, push, deployment or production-content seeding is part of this implementation.


Final running-app checks: LAN homepage and `/blogs` return 200; `/blogs` contains editorial content in its initial HTML with one canonical; public Blog API returns zero articles until the owner creates real content; unauthenticated Blog administration returns 401; health returns Healthy. Browser rendering at the LAN URL reports no runtime errors or mobile horizontal overflow.
