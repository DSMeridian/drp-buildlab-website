# Blog articles

One Markdown file per article. They are usually written in the team CMS
(cms.drpbuildlab.com), which commits them here, but a file written by hand
works the same way. `tools/concept/blog.js` reads them; the CMS side of the
format is `src/lib/blog/contract.ts` in the drp_cms repo. If you change one,
change the other.

```
content/blog/<slug>.md               the article
content/blog/media/<slug>/<file>     its images: png, jpg, webp, avif or gif (no svg)
```

A push that touches this folder runs `.github/workflows/blog.yml`, which
rebuilds `concept/` and commits it. Locally, the usual
`node tools/concept/build.js && node tools/concept/localize.js` does the same.

## Frontmatter

```yaml
---
title: How a website form becomes a tracked lead in five seconds
slug: website-form-to-tracked-lead      # must match the file name; the URL is /<market>/blog/<slug>/
date: 2026-11-04                        # YYYY-MM-DD, shown in each market's own date format
updated: 2026-11-20                     # optional
author: Hilmi
category: technical                     # technical | partner | collab
tags: [automation, forms]
langs: [en, nl, fr]                     # the article is only published in these languages
excerpt: A look at the automation behind every quote request…   # index card + meta description
cover:                                  # optional; also the og:image
  src: ./media/website-form-to-tracked-lead/3f2a1b9c-cover.webp
  alt: Diagram of the form-to-lead flow
video:                                  # optional
  url: https://www.youtube.com/shorts/abc123   # YouTube, Vimeo or an .mp4/.webm on a CDN; https only
  aspect: "9:16"                        # 16:9 | 9:16 | 1:1
  poster: ./media/website-form-to-tracked-lead/77aa01ff-poster.jpg
  creator: "@partnerhandle"
  sourceUrl: https://www.instagram.com/p/…
draft: false                            # true: kept in git, never built
---
```

## Rules the build enforces

- **English is the source** and is always published, whether or not `langs` lists it. Every other language in `langs` is machine-translated by DeepL in `localize.js` and cached in `tools/concept/i18n/`. Correct a translation there, as for any other page.
- A market whose language is not in `langs` gets no page for the article. Its language menu and market picker link to that market's `/blog/` instead, and hreflang and the sitemap list only the versions that exist.
- **No raw HTML.** It is shown as text, the same as in the CMS preview. Code blocks and `inline code` are never translated.
- Images must live in `media/<slug>/` and be referenced as `./media/<slug>/<file>`. They are served once from `/media/blog/<slug>/`, not copied into every market. A missing image fails the build.
- Links are absolute (`https://…`) or site-relative (`/contact/`). Site-relative links get the market prefix automatically.
- **Videos are never committed.** Put them on YouTube, Vimeo or a video CDN. The page shows the poster, and nothing from the video host loads until the visitor presses play.
- Blog is always in the main menu and footer. Before the first article is published, `/blog/` says the first articles are on their way.
- Every article page gets like, share and comment blocks (build.js `reactBar`/`comments`, site.js, `/api/blog`). Comments are moderated in the CMS, and nothing about them is in git. See the Blog section of the main README.
