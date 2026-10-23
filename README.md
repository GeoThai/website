# GeoThai website

[![CI](https://github.com/GeoThai/website/actions/workflows/ci.yml/badge.svg)](https://github.com/GeoThai/website/actions/workflows/ci.yml)
[![Deploy](https://github.com/GeoThai/website/actions/workflows/deploy.yml/badge.svg)](https://github.com/GeoThai/website/actions/workflows/deploy.yml)

The website for [GeoThai/data](https://github.com/GeoThai/data): every province, district, subdistrict and postal code of Thailand, one page each.

Live at [geothai.fasu.dev](https://geothai.fasu.dev).

## What it builds

| Pages                      |   Count | Example                                                |
| -------------------------- | ------: | ------------------------------------------------------ |
| Home, Docs, Changelog, Map |       4 | `/map/`                                                |
| Provinces                  |  1 + 77 | `/84-surat-thani/`                                     |
| Districts                  |     928 | `/84-surat-thani/8405-ko-pha-ngan/`                    |
| Subdistricts               |   7,436 | `/84-surat-thani/8405-ko-pha-ngan/840501-ko-pha-ngan/` |
| Postal codes               | 1 + 976 | `/postal-codes/84280/`                                 |

Every page is static HTML. The area and postal code pages have an SVG map from [`@geothai/maps`](https://github.com/GeoThai/maps), drawn at build time, with tooltips and zoom. The map page draws a pasted table in the browser. The build also writes `data/search.json` for the search on the home page, a sitemap and JSON-LD for search engines.

## Requirements

- [Bun](https://bun.sh) 1.4.2 or later
- Internet access during the build. The build downloads the data from GitHub.

## Get started

```sh
bun install
bun run dev
```

The dev server runs at `http://localhost:4321`. Every URL ends with `/`, so open `/provinces/`, not `/provinces`.

## Commands

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `bun run dev`       | Starts the dev server                             |
| `bun run build`     | Builds the site into `dist/`                      |
| `bun run preview`   | Serves `dist/` to check a build                   |
| `bun run check`     | Runs Biome: format, lint and Tailwind class rules |
| `bun run check:fix` | Runs Biome and applies the safe fixes             |
| `bun run typecheck` | Runs `astro check`                                |
| `bun run test`      | Runs the unit tests in `src/utils/`               |

Run `check`, `typecheck` and `test` before you commit. CI runs them on every push, then builds the site.

## Data

The data comes from [GeoThai/data](https://github.com/GeoThai/data). To see how it is built and checked, read [How it is built](https://github.com/GeoThai/data#how-it-is-built).

The site shows one release of GeoThai/data. The release is in `data.version`, such as `v2026.10.23`.

`update.yml` moves the site to each new release by itself. It runs daily and on the `data-release` event that GeoThai/source sends when a release ships. To move by hand, write the new release tag in `data.version` and run `bun run build`.

The build reads the JSON files, `datapackage.json` and `CHANGELOG.md` of that release from `raw.githubusercontent.com`. If a file is missing, the build stops with the file name and the HTTP status.

## Project structure

```text
src/
├── components/
│   ├── home/      sections of the home page
│   ├── changelog/ the map of each release
│   ├── layout/    header and footer
│   ├── place/     parts of the area pages: heading, maps, list filter, source line
│   └── ui/        button, input, card, container, code blocks
├── layouts/       Base: head tags, header, footer, smooth scroll
├── lib/           data loading, motion, map tooltips and zoom
├── pages/         one file per route
├── styles/        Tailwind theme: colors, type, radius, motion
└── utils/         pure functions with tests: slugs, search, formatting, JSON-LD, pasted tables
```

## Deploy

The site runs on Cloudflare Workers as static assets. `wrangler.jsonc` holds the settings.

| Workflow     | When it runs           | What it does                                                                                                    |
| ------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `deploy.yml` | On a push to `main`    | Tests, builds and deploys the site                                                                              |
| `update.yml` | Every day at 04:00 UTC | If GeoThai/data has a new release, it writes the tag to `data.version`, builds, commits and starts `deploy.yml` |

The `production` environment on GitHub holds two secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Stack

- [Astro](https://astro.build) for static pages
- [`@geothai/maps`](https://github.com/GeoThai/maps) for the maps
- [Tailwind CSS](https://tailwindcss.com) v4 for styles
- [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering) for motion. If the system asks for reduced motion, both stop.
- [Biome](https://biomejs.dev) for format and lint
- Fonts: Bai Jamjuree and JetBrains Mono, [SIL Open Font License 1.1](https://openfontlicense.org)
- Icons: [Solar](https://www.figma.com/community/file/1166831539721848736) by 480 Design, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), through [Iconify](https://iconify.design)

## License

The code is [MIT](./LICENSE). The GeoThai name and logo are not part of it: see [TRADEMARKS.md](./TRADEMARKS.md).

The data is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). When you use the data, credit GeoThai.
