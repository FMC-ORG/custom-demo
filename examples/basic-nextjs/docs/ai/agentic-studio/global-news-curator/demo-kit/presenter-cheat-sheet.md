# Presenter cheat sheet: HEINEKEN Global News Curator

**Every scenario:** Agentic → Chat → **new chat** → agent **HEINEKEN Global News Curator** → type `What's new in our local markets that we should share globally?` Answer by the **meaning** of the option (letters and scores can change). When unsure, take **(Recommended)**.

## Scenario 1: From local market to global newsroom

| Question | Answer |
|---|---|
| Which story should go global? | **HEINEKEN Vietnam makes progress on Brewing a Better Vietnam** |
| Image | **Reuse the local story's image** (Recommended) |
| Any flagged claim | **Leave it out** (Recommended) |
| Draft review | **Write it** |

Point out: score per criterion and reason · placeholder pages left out · facts traced to local paragraphs · local → global summary · credit line "First published by HEINEKEN Vietnam on 16 June 2026." · SEO title ends `| The HEINEKEN Company`.

## Scenario 2: Duplicate guard and brand check

| Question | Answer |
|---|---|
| Shortlist | Show **Brewing a Better Vietnam** flagged **already global** and ranked down |
| Which story should go global? | **Tiger Êm** (low score: "the marketer decides") |
| Image | **Reuse the local story's image** (Recommended) |
| "…the leading international premium beer brand…" | **Leave it out** |
| Other promotional claims ("perfect choice", "world-acclaimed heritage") | **Leave it out** |
| Anything about drinking and social occasions | **(Recommended)** |
| Draft review | **Write it** |

Point out: no duplicate · claims removed, nothing added in their place · headline in sentence case · credit line with 21 May 2026.
Alternative ending: pick **Brewing a Better Vietnam** again → choose **Stop** at "update / new copy / stop".

## After each run

Click **Open in Page builder** → show headline, body, credit line and SEO fields → "An editor reviews and publishes; the agent never publishes and never changes the local site."

**Never publish demo pages.** Reset: delete the new global stories under `heineken` `/newsroom/2026` (they end with "First published by HEINEKEN Vietnam on …"). Never touch `heineken-vietnam`.

| If… | Then… |
|---|---|
| Story already flagged in scenario 1 | A previous run left its page: reset, new chat |
| "No local story matches …" | Use the plain request |
| Agent recommends no image | Continue without an image |
| Marketer MCP or skill missing | Agent → Tools & skills → turn it on / attach it → new chat |
| Anything odd | New chat, run again: nothing is written before your approval |
