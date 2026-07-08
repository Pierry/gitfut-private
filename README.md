<div align="center">

<img src="public/mascot.webp" width="120" alt="GitFut mascot">

# GitFut (private fork)

your GitHub, rated out of 99

<br/>

<a href="https://gitfut.com/torvalds"><img src="https://gitfut.com/torvalds.png" width="220" alt="GitFut card"></a>
<a href="https://gitfut.com/ThePrimeagen"><img src="https://gitfut.com/ThePrimeagen.png" width="220" alt="GitFut card"></a>
<a href="https://gitfut.com/t3dotgg"><img src="https://gitfut.com/t3dotgg.png" width="220" alt="GitFut card"></a>
<a href="https://gitfut.com/Pierry"><img src="https://gitfut.com/Pierry.png" width="220" alt="GitFut card"></a>

</div>

<br/>

A private fork of [GitFut](https://gitfut.com) ([Younesfdj/gitfut](https://github.com/Younesfdj/gitfut)), rebuilt for company-internal work. The public site scouts anyone from their public GitHub. This fork runs entirely in your browser under your own GitHub token, so it can read the private contributions the public site can't, and it scores everyone on signals that actually count inside an org.

## What's different

| | Public GitFut | This fork |
|---|---|---|
| Runs on | A server (Next.js + Redis) | Fully static (`output: export`), no server |
| Scouts as | A shared token | Your GitHub PAT, kept only in your browser |
| Can see | Public activity | Private contributions you're allowed to see (org teammates) |
| Scores on | Stars, followers, issues | PRs, commits, reviews, contributions |
| Adds | Card image | Collection binder, share links, Duel, PNG export |

Your token never leaves your machine, and the private card it produces is cached only in your browser.

## How scoring works

Internal repos don't have stars, followers or open issues that mean anything, so those are dropped. What's left is contribution, read from GitHub's GraphQL `contributionsCollection` (the only API that returns the private counts matching your profile graph).

| | Stat | From |
|:--:|:--|:--|
| PAC | Pace | Active days you shipped in the last year |
| SHO | Shooting | Commits |
| PAS | Passing | Pull requests to others |
| DRI | Dribbling | Account age (caps at 4 years) |
| DEF | Defending | Code reviews |
| PHY | Physical | Lifetime contributions |

The six stats *are* the metric bars, 1:1. Your overall is the position-weighted average of them. Position and archetype come from the shape of the stats: a shooting spike is a poacher, a passing-and-dribbling lean is a deep playmaker.

Finishes: BRONZE (<60), SILVER (60-71), GOLD (72+), HERO (high overall and very active this year, gets its own teal frame), TOTY (every stat 90+), ICON (90+ on a 4-year-plus account), FOUNDER (bespoke art). No IN-FORM.

## Beyond the card

- **Collection** — every card you scout is kept in a browser-only binder (newest 40), so the home shows your squad without refetching.
- **Share links** — the URL carries the card (raw signals, gzipped), so a link opens the exact card you made even for someone with no token and no server to look it up on. Plus one-tap brag text for X, LinkedIn, WhatsApp.
- **Duel** — two cards head-to-head: stat shootout, radar overlay, dominance tally.
- **PNG export** — download or copy the card as an image (the watermark only shows up in the export).

<br/>

<div align="center">

Next.js · TypeScript · Tailwind · static export

Forked from [gitfut.com](https://gitfut.com)

</div>
