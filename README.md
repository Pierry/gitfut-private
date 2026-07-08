<div align="center">

<img src="public/mascot.webp" width="120" alt="GitFut mascot">

# GitFut — private fork

**your GitHub, rated out of 99** ⚽ &nbsp;·&nbsp; *now scoring the work that never leaves the org*

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&duration=2600&pause=800&color=39D353&center=true&vCenter=true&width=680&height=42&lines=A+fully-static%2C+private+fork+of+GitFut;Scouts+in+YOUR+browser%2C+with+YOUR+token;Reads+private+contributions+public+GitFut+can%27t" alt="A fully-static, private fork of GitFut — scouts in your browser with your own token">

<br/><br/>

<a href="https://gitfut.com/torvalds"><img src="https://gitfut.com/torvalds.png" width="240" alt="GitFut card"></a>
<a href="https://gitfut.com/ThePrimeagen"><img src="https://gitfut.com/ThePrimeagen.png" width="240" alt="GitFut card"></a>
<a href="https://gitfut.com/t3dotgg"><img src="https://gitfut.com/t3dotgg.png" width="240" alt="GitFut card"></a>

</div>

<br/>

> This is a **private, self-hosted fork** of [GitFut](https://gitfut.com) ([Younesfdj/gitfut](https://github.com/Younesfdj/gitfut)). The public site scouts anyone from their public GitHub. This fork is built for **company-internal work**: it runs entirely in your browser under **your** GitHub token, so it can see the private contributions the public site never can — and it re-scores everyone on signals that actually mean something inside an org.

<br/>

## 🔒 &nbsp;What's different here

| | Public GitFut | This fork |
|---|---|---|
| **Where it runs** | A server (Next.js + Redis cache) | **Fully static** (`output: export`) — no server, no cache, GitHub Pages |
| **Who it scouts as** | A shared, anonymous token | **Your** GitHub PAT, held only in your browser's `localStorage` |
| **What it can see** | Public activity only | **Private contributions** you're allowed to see (e.g. teammates in a shared org) |
| **Scoring** | Stars / followers / issues | **Company-internal signals** — PRs, commits, reviews, contributions |
| **Extras** | Embeddable card image | **Collection** binder · **self-contained share links** · **head-to-head Duel** · PNG export |

Your token never leaves your machine, and the private-augmented card it produces is cached only in your browser — it can't leak to anyone else.

<br/>

## ⚙️ &nbsp;How the scouting works

Calibrated for **private, company-internal** repos, where stars, followers and open issues are meaningless (nobody stars an internal repo, nobody follows a colleague). Dropped. What's left is real contribution, read straight from GitHub's GraphQL `contributionsCollection` — the only API that returns the private (restricted) counts that match your profile graph.

| | Stat | Scouted from |
|:--:|:--|:--|
| **PAC** | Pace | Active days you shipped in the last year |
| **SHO** | Shooting | Commits (output) |
| **PAS** | Passing | Pull requests to others (collaboration) |
| **DRI** | Dribbling | Account age / seasoning — caps at **4 years** |
| **DEF** | Defending | Code reviews (stewardship) |
| **PHY** | Physical | Lifetime contributions (volume) |

Each stat is a valued signal mapped onto its own 0–99 bar — and the card's six stats **are** those bars, 1:1. No z-scores, no legacy gate: the card face and the scout receipts always tell the same story. Your **overall** is the position-weighted average of the six. Your **position** and **archetype** are read from your stat shape — a shooting spike scouts a poacher up top, a passing-and-dribbling lean scouts a deep playmaker.

Every card walks out in a finish:

<div align="center">

![Bronze](https://img.shields.io/badge/BRONZE-%3C60-CD7F32?style=flat-square&labelColor=2A1A0C)
![Silver](https://img.shields.io/badge/SILVER-60--71-AAB2BD?style=flat-square&labelColor=262B33)
![Gold](https://img.shields.io/badge/GOLD-72%2B-E6B422?style=flat-square&labelColor=3A2806)
![Hero](https://img.shields.io/badge/HERO-high%20%2B%20relentless-1CC3B2?style=flat-square&labelColor=05302C)
![TOTY](https://img.shields.io/badge/TOTY-every%20stat%2090%2B-3B7AFF?style=flat-square&labelColor=10254F)
![Icon](https://img.shields.io/badge/ICON-90%2B%20%26%204y%2B-F3D688?style=flat-square&labelColor=2A1A45)
![Founder](https://img.shields.io/badge/FOUNDER-bespoke-FF2F45?style=flat-square&labelColor=3A0A10)

</div>

**HERO** gets its own teal frame — high overall *and* very active this year. **TOTY** is elite across the board (every stat clears 90). **ICON** is the mature great (90+ on a 4-year-plus account). Founders get bespoke card art and an accent that tints their whole scout report. *(The public fork's IN-FORM tier is dropped.)*

<br/>

## ✨ &nbsp;Beyond the card

- **Your binder** — every card you scout is kept in a browser-only **collection** (newest 40), so the home page shows your squad side by side, openable with no refetch.
- **Share links that carry the card** — a share URL packs the raw signals (gzip + base64url, ~20 numbers), so the link opens the *exact* card you generated for anyone — even someone with no token and no server to look it up on. Plus one-tap brag text for X / LinkedIn / WhatsApp.
- **Duel** — put two cards head-to-head: stat-by-stat shootout, radar overlay, dominance tally.
- **PNG export** — download or copy your card as an image (signature watermark painted only into the export, never on-screen).

<br/>

## 🛠 &nbsp;Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # vitest
npm run build      # static export → ./out (deploy anywhere: GitHub Pages, S3, …)
```

Hosting under a subpath (e.g. GitHub Pages `/<repo>`)? Set the base path in `next.config` — every asset URL is `basePath`-aware. Enter your GitHub PAT once in the app; it stays in your browser.

<br/>

<div align="center">

**Built with** Next.js · TypeScript · Tailwind · static export (no server)

Forked with love from **[gitfut.com](https://gitfut.com)** &nbsp;·&nbsp; scout your team today

<img src="https://capsule-render.vercel.app/api?type=waving&height=90&color=0:39d353,100:006d32&section=footer" alt="" width="100%">

</div>
