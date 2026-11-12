# HEINEKEN Global News Curator: Demo Guide

An AI agent in SitecoreAI Agentic Studio for a **global marketer**: it scans the local-market newsrooms, ranks the local stories by relevance for a global audience, and turns the one story the marketer picks into a ready-to-review **global** News Story on the HEINEKEN global newsroom, checked against The HEINEKEN Company Brand Kit and crediting the local market.

This guide covers two demo scenarios. Each takes about 10 to 15 minutes, including questions from the audience.

## 1. The demo story

Global communications teams rarely see what their local markets publish. Finding the stories that matter globally means reading every local newsroom, and re-publishing one means rewriting it for an international reader, refilling every SEO and listing field, and re-checking brand rules.

The Global News Curator does this in one conversation:

1. **Scans** every local-market newsroom and shows a **ranked shortlist** with a score per criterion and a one-line reason.
2. **Lets the marketer pick** one story, then shows a **fact sheet**: every fact it will use, with its source paragraph in the local story.
3. **Asks** a few multiple-choice questions: an existing global page, the image, and every statement that breaks a Brand Kit rule.
4. **Drafts** the global edit (headline, standfirst, summary, body, SEO and social fields) with character counts, a brand checklist and a **local → global** summary.
5. **Writes** the page on the global site only after approval, reads it back to verify, and gives a link to open it in Page builder.

What to stress throughout:

| Message | Where the audience sees it |
|---|---|
| **Curation with visible reasons.** The ranking follows fixed criteria (global strategy, global brand, measurable impact, recency, already global), not a black box | The shortlist table with a score per criterion |
| **Same news, global voice.** The global story uses only the local story's facts, quotes and figures, reframed for an international reader, and credits the market | The fact sheet, the local → global summary, the closing line "First published by HEINEKEN Vietnam on …" |
| **Brand governance built in.** The Brand Kit decides naming, tone, SEO limits and responsible-alcohol wording | One question per risky claim, quoting the claim and naming the rule |
| **No duplicates.** A story already brought to the global newsroom is flagged and ranked down | The "already global" flag in scenario 2 |
| **Human in control.** The marketer picks the story, answers the questions and approves the draft; nothing is published | The draft review with a tick-or-cross checklist; the closing line "Nothing was published." |

## 2. The kit

| File | Use |
|---|---|
| `demo-guide.pdf` | This guide |
| `presenter-cheat-sheet.pdf` | One page to keep open during the demo: the answer to give at each question |

No input files are needed: the agent reads the local newsrooms itself.

## 3. Before the demo

Do this at least 15 minutes before the audience joins.

| # | Check | How |
|---|---|---|
| 1 | You can sign in to the partner SitecoreAI tenant and open **Agentic Studio** | Use the presenter account |
| 2 | The agent **HEINEKEN Global News Curator** exists, with the skill **HEINEKEN Global News Curator** attached and **Marketer MCP** on | Agentic Studio → **Agents** → the agent → **Tools & skills** |
| 3 | The Brand Kit **The HEINEKEN Company** is published | Brand Kits |
| 4 | The local market `heineken-vietnam` has its stories under `/newsroom/2026` | Pages → site `heineken-vietnam` → `newsroom/2026` |
| 5 | The global site `heineken` has a **2026** News Year page under `/newsroom` | Pages → site `heineken` → `newsroom/2026` |
| 6 | **No global story from an earlier run** of this demo is left under global `/newsroom/2026` (see *Reset*) | Otherwise scenario 1's story shows as "already global" from the start |
| 7 | Do a full dry run of both scenarios, then reset | Same steps as the live demo |

During the demo, keep two browser tabs open: **Agentic → Chat** and **Pages** (signed in to the same tenant).

**Optional end-to-end story.** Run the *HEINEKEN Newsroom Story Writer* demo (scenario 2, the Vietnam water programme) first. Its new Vietnam story then appears in this agent's shortlist, often at the top: "the local market published it an hour ago; the global marketer finds it and brings it to the global newsroom".

## 4. How a run works

The agent asks **one question per message**, each with lettered options (A, B, C, D), and marks one option **(Recommended)** with a reason.

| Step | What you see | What you do |
|---|---|---|
| Shortlist | Up to 5 local stories: title, market, date, five scores, total, reason, flags (already global, translated, has image) | Walk through the scores; explain the criteria |
| Pick | "Which story should go to the global newsroom?" | Pick the story named in the scenario, even when it is not the recommended one |
| Fact sheet | Facts with their source paragraph, content it will not use (images, links, boilerplate), naming corrections, flagged claims | Scroll through it slowly |
| Existing page | Only when the story is already global | Answer as the scenario says |
| Image | Reuse the local story's image, no image, another image, stop | Reuse the local image when it is recommended |
| Flagged claims | One question per statement that breaks a Brand Kit rule | Answer as the scenario says |
| Draft review | The whole page as a table (field, value, characters/limit, evidence), the checklist, and the **local → global** summary | Point out the summary and the credit line, then choose **Write it** |
| Report | Page name, path, version, source story, fields, gaps, **Open in Page builder** | Click the link |

**General rules for answering:**

- The **letters and the scores can differ** slightly between runs: answer by the **meaning** of the option, not the letter.
- When unsure, take the **(Recommended)** option.
- **Always start a scenario in a new chat.** Never continue a previous conversation.

## 5. Scenario 1: From local market to global newsroom

**Story:** the global marketer asks what the local markets have published that deserves a global audience. The agent ranks the Vietnam newsroom and the marketer picks HEINEKEN Vietnam's sustainability progress story, which has a real photo.

### Run it

**Step 1.** Open **Agentic → Chat**, start a **new chat** and select **HEINEKEN Global News Curator**.

**Step 2.** Type:

```text
What's new in our local markets that we should share globally?
```

**Step 3.** Walk through the **shortlist**. Expect the sustainability stories (Brewing a Better Vietnam, the water programme, the Tiger storm-recovery programme) at the top, and the Larue festival and the Tiger Êm product launch at the bottom. Point out:

- Each score has a reason: Brewing a Better Vietnam names the strategy and reports results with figures; Larue is a local-only brand at a local event.
- Placeholder pages in the newsroom are left out automatically.

**Step 4.** Answer the questions:

| Question | Answer | Talk track |
|---|---|---|
| Which story should go global? | **HEINEKEN Vietnam makes progress on Brewing a Better Vietnam** (whatever its rank) | "The ranking advises; the marketer decides. This one has strong results and a real photo." |
| Image | **Reuse the local story's image** (Recommended) | "It checked the local photo first: a real image, not a placeholder." |
| Any flagged claim | **Leave it out** (Recommended) | "Same Brand Kit rules as every HEINEKEN story: the agent quotes the claim and names the rule." |

**Step 5. Fact sheet and draft review:** point out:

- Facts and figures traced to paragraphs of the local story; nothing added from outside.
- The **local → global** summary: what was reframed for an international reader.
- The last paragraph: **"First published by HEINEKEN Vietnam on 16 June 2026."**
- SEO title ending in `| The HEINEKEN Company`; character counts within limits.

Answer **Write it**.

**Step 6. Report:** click **Open in Page builder** (see *Showing the result*).

### What good looks like

- A new page under `heineken` → `/newsroom/2026`, version 1, dated 16 June 2026.
- The Vietnam photo as thumbnail and social image.
- Subjects from the **global** site (Sustainability, possibly Corporate), article type Article.
- The body ends with the credit line; nothing changed on the Vietnam site.

## 6. Scenario 2: Duplicate guard and brand check

**Story:** the marketer runs the agent again. The story from scenario 1 is now flagged as already global. Marketing also wants the Tiger Êm product launch on the global newsroom, even though it ranks low; the agent keeps it brand-safe.

### Run it

**Step 1.** Start a **new chat** with **HEINEKEN Global News Curator**.

**Step 2.** Type the same request:

```text
What's new in our local markets that we should share globally?
```

**Step 3.** In the shortlist, point out that **Brewing a Better Vietnam** is now flagged **already global** and has dropped in the ranking: "It knows what the global newsroom already carries, so the same news is never published twice."

**Step 4.** Answer the questions:

| Question | Answer | Talk track |
|---|---|---|
| Which story should go global? | **Tiger Êm** (the product launch, near the bottom) | "Low score: it is a product launch with no strategic link. The marketer can still choose it." |
| Image | **Reuse the local story's image** (Recommended) | As in scenario 1 |
| "Tiger® Beer, the leading international premium beer brand …" | **Leave it out** (Recommended) | "An unsourced superlative: the Brand Kit does not allow it." |
| Other promotional claims (for example "a perfect choice", "world-acclaimed heritage") | **Leave it out** (Recommended) | "Each claim gets its own question; the marketer decides, the agent never decides alone." |
| Anything about drinking and social occasions | The **(Recommended)** option | "Responsible-alcohol wording is checked on every story." |

**Step 5. Draft review:** show the local → global summary: the claims left out, the headline rewritten from capitals to sentence case. Answer **Write it**.

**Step 6. Report:** click **Open in Page builder**.

### What good looks like

- A new page under `heineken` → `/newsroom/2026`, dated 21 May 2026, with the Tiger Êm photo.
- No superlatives or promotional claims you left out; the credit line "First published by HEINEKEN Vietnam on 21 May 2026."

**Alternative ending.** Instead of Tiger Êm, pick **Brewing a Better Vietnam** again: the agent asks whether to update the global page as a new version, create a second copy or stop. Choose **Stop** to show the guard without writing.

## 7. Showing the result

1. Click **Open in Page builder** in the agent's report. The page opens on the global site.
2. Show the **headline, standfirst and body**, and the **credit line** at the end.
3. Show the page's **SEO and social fields** (metadata title, description, keywords, Open Graph title and description) in the page's content fields. Find where your Pages version shows them during the dry run.
4. Optional: open the original story on `heineken-vietnam` side by side, to show the global edit.
5. Close with: "The agent created a draft on the global site. An editor reviews it and publishes through the normal process."

**Never publish the demo pages.** The global site has no workflow, so a site publish would put them live.

## 8. Reset after the demo

Delete the global pages the demo created so the next demo starts clean:

| Site | Where | Pages to delete |
|---|---|---|
| `heineken` | `/newsroom/2026` | The global edit of Brewing a Better Vietnam and the global edit of Tiger Êm (both end with "First published by HEINEKEN Vietnam on …") |

Delete **only** these pages. Never delete or change anything on `heineken-vietnam`: the agent only reads the local site, and the local stories are its demo content.

## 9. Troubleshooting

| What happens | What to do |
|---|---|
| "The Marketer MCP is not available to this agent" | Agent → **Tools & skills** → turn **Marketer MCP** on, save, start a new chat |
| "This agent is misconfigured: the … skill is not attached" | Agent → **Tools & skills** → attach the skill **HEINEKEN Global News Curator**, save, start a new chat |
| "The Brand Kit 'The HEINEKEN Company' is not published" | Publish the Brand Kit, start a new chat |
| "No local story matches …" | The theme or period in your request was too narrow: run the plain request from scenario 1 |
| The shortlist has fewer stories than expected, or Brewing a Better Vietnam is already flagged in scenario 1 | A previous run left a global page: reset (section 8) and start a new chat |
| "There is no year page for 2026 under the global /newsroom" | Create the News Year page `2026` under global `/newsroom`, then run again |
| The agent recommends **no image** | The local image could not be read (for example the Tiger storm story's image): continue without an image |
| No **Open in Page builder** link | Open Pages → site `heineken` → `/newsroom/2026` → the new story |
| The conversation goes off track | Start a new chat and run the scenario again. Nothing is written before your final approval |

## 10. Questions the audience may ask

| Question | Answer |
|---|---|
| Does it publish? | Never. It creates or updates one draft page on the global site and stops. |
| Does it change the local site? | No. It only reads the local-market newsrooms. |
| How does it rank? | Fixed, visible criteria: link to the global strategy (Brew a Better World), global brand, measurable impact, recency, and whether the story is already global. The marketer can pick any story. |
| Where do the facts come from? | Only from the local story and the marketer's answers. It adds no outside facts, figures or quotes. |
| Can it filter by topic or period? | Yes: add a theme or a period to the request, for example "on sustainability" or "since September". |
| What about stories only in the local language? | It reads the local-language version when there is no English one, translates it, and labels translated quotes in the draft. |
| Can it add more markets? | Yes: each new market site is one row in the agent's settings (market name, site, newsroom, language). |
