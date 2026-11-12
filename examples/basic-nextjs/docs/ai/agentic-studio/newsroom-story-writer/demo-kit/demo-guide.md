# HEINEKEN Newsroom Story Writer: Demo Guide

An AI agent in SitecoreAI Agentic Studio that turns a press release into a ready-to-review **News Story** page on the HEINEKEN newsroom, checked against The HEINEKEN Company Brand Kit, on either the **global** site or a **local market** site.

This guide covers two demo scenarios, one per site. Each takes about 10 to 15 minutes, including questions from the audience.

## 1. The demo story

Newsroom teams turn press releases into web stories by hand: rewriting for the web, filling a dozen SEO and listing fields, and checking brand naming and responsible-alcohol rules. Global and local market teams do the same work on different sites.

The Story Writer does this in one conversation:

1. **Reads** the release (attached file, pasted text, URL or notes) and shows a **fact sheet**: every fact it will use, with its source in the release.
2. **Asks** a few multiple-choice questions: which site, missing facts, the image, and every statement that breaks a Brand Kit rule.
3. **Drafts** the whole page (headline, standfirst, summary, body, SEO and social fields), counts every character limit and runs a brand checklist.
4. **Writes** the page in Sitecore only after approval, reads it back to verify, and gives a link to open it in Page builder.

What to stress throughout:

| Message | Where the audience sees it |
|---|---|
| **No invented facts.** Every fact, quote and figure comes from the release or the presenter's answers | The fact sheet cites a paragraph for each fact; missing information becomes a reported gap, never filler |
| **Brand governance built in.** The Brand Kit decides naming, tone, SEO limits and responsible-alcohol wording | Naming corrections in the fact sheet; one question per risky claim, quoting the claim and naming the rule |
| **Human in control.** Nothing is written before every answer and an explicit approval; nothing is ever published | The draft review with a tick-or-cross checklist; the closing line "Nothing was published." |
| **Global and local, one agent.** The same agent and rules serve the global newsroom and a local market newsroom | Scenario 1 goes to `heineken`, scenario 2 to `heineken-vietnam` |

## 2. The kit

| File | Use |
|---|---|
| `demo-guide.pdf` | This guide |
| `presenter-cheat-sheet.pdf` | One page to keep open during the demo: the answer to give at each question |
| `scenario-1-global-going-out-study.docx` | Scenario 1 input. A **fictional** HEINEKEN Cambodia press release written for this demo, with deliberate brand-rule traps. Never publish its page |
| `scenario-2-vietnam-water-programme.docx` | Scenario 2 input. HEINEKEN Vietnam's **real** press release of 8 September 2026 (water conservation programme with the Ministry of Agriculture and Environment and WWF-Viet Nam). Published in Vietnamese only; this English version was translated for the demo, with the two quotes as printed in English by Vietnam News on 9 September 2026 |

## 3. Before the demo

Do this at least 15 minutes before the audience joins.

| # | Check | How |
|---|---|---|
| 1 | You can sign in to the partner SitecoreAI tenant and open **Agentic Studio** | Use the presenter account |
| 2 | The agent **HEINEKEN Newsroom Story Writer** exists | Agentic Studio → **Agents** |
| 3 | The agent has the skill **HEINEKEN Newsroom Story Writer** attached and **Marketer MCP** on | Open the agent → **Tools & skills** |
| 4 | The Brand Kit **The HEINEKEN Company** is published | Brand Kits |
| 5 | Both sites have a **2026** News Year page under `/newsroom` | Pages → site `heineken` → `newsroom/2026`; same for `heineken-vietnam` |
| 6 | **No story from an earlier demo run** is left under `/newsroom/2026` (see *Reset*) | Otherwise the agent asks whether to update it, which adds a question to the script |
| 7 | Both input files are on your desktop and open correctly in Word | Keep them closed during the demo |
| 8 | Do a full dry run of both scenarios, then reset | Same steps as the live demo |

During the demo, keep two browser tabs open: **Agentic → Chat** and **Pages** (signed in to the same tenant).

## 4. How a run works

Every run follows the same steps. The agent asks **one question per message**, each with lettered options (A, B, C, D), and marks one option **(Recommended)** with a reason.

| Step | What you see | What you do |
|---|---|---|
| Fact sheet | A table of facts with sources, a list of content it will not use (contacts, "About" sections, download links), naming corrections, and the flagged claims | Scroll through it slowly; this is the "no invented facts" moment |
| Site | "Which newsroom should this story go to?" | Pick the site named in the scenario |
| Missing facts | Only if the release lacks something (for example a date) | Pick the recommended option |
| Image | Whether to add an image | Choose **no image**: the sandbox media library holds only placeholder images, which the agent rejects on purpose |
| Flagged claims | One question per statement that breaks a Brand Kit rule, quoting it and naming the rule | Answer as the scenario says |
| Draft review | The whole page as a table (field, value, characters/limit, evidence) and the checklist with a tick or cross per line | Point out the counts and the checklist, then choose **Write it** |
| Report | Page name, path, version, every field with its evidence, gaps, and **Open in Page builder** | Click the link |

**General rules for answering:**

- The **letters can differ** from this guide between runs: always answer by the **meaning** of the option, not the letter.
- When unsure, take the **(Recommended)** option.
- Type answers in the chat box as a single letter (`A`) or, where the guide says so, as your own sentence.
- **Always start a scenario in a new chat.** Never continue a previous conversation.

## 5. Scenario 1: Global newsroom

**Story:** HEINEKEN Cambodia publishes a study on how Cambodians go out. Cambodia has no site of its own, so the story belongs on the global newsroom. The release contains three statements a brand reviewer would stop.

**Input:** `scenario-1-global-going-out-study.docx` (fictional).

### Run it

**Step 1.** Open **Agentic → Chat**, start a **new chat** and select **HEINEKEN Newsroom Story Writer**.

**Step 2.** Attach `scenario-1-global-going-out-study.docx` and type:

```text
Write a news story from the attached press release.
```

**Step 3.** Walk through the fact sheet. Point out:

- **Naming corrected by the Brand Kit:** "Heineken Cambodia" → **HEINEKEN Cambodia** (the company), "Heineken 0.0" → **Heineken® 0.0** (the product), "Praise The Bar" → **Praise the Bar**.
- **Figures kept exactly as written**, ranges included ("64% to 81%", "85% to 93%").
- The **research note** (about 1,500 adults, July to September 2026, sample results rather than population estimates) is kept, so the figures are not presented as national facts.
- **Not used:** "-ENDS-", the download link, the "About HEINEKEN Cambodia" section and the media contact.
- The **Khmer quote** is translated and labelled *(translated from Khmer)*.

**Step 4.** Answer the questions:

| Question | Answer | Talk track |
|---|---|---|
| Which newsroom? | **`heineken`, the global site** (Recommended) | "Cambodia has no local site, so the agent recommends the global newsroom. It always asks; it never decides the site alone." |
| Image | **No image** | "It never picks or generates an image on its own; it only uses an approved image the editor names." |
| "This proves that Cambodians cannot really enjoy a night out without a cold beer in their hand." | **Leave it out** (Recommended) | "Presents alcohol as necessary for enjoyment: a responsible-alcohol rule in the Brand Kit." |
| "Even younger students say they cannot wait until they are old enough to join them." | **Leave it out** (Recommended) | "Content that speaks to minors: never allowed." |
| Bopha Lim: "… the best investment a venue can make." | **Keep it only as an attributed verbatim quote** | "An unsourced superlative. Because a named person said it, the editor may keep it as her quote, word for word. Outside a quote it would go." |

**Step 5. Draft review:** show the character counts (headline, summary, SEO title 50–60, SEO description 140–160) and the checklist. Point out that the training for 500 venue staff is written as a **plan**, not as done. Answer **Write it**.

**Step 6. Report:** show the field table and the gaps (no image), then click **Open in Page builder** (see *Showing the result*).

### What good looks like

- A new page under `heineken` → `/newsroom/2026`, version 1.
- Subject Corporate (sometimes also Sustainability), article type Article, date 5 November 2026.
- SEO title ending in `| The HEINEKEN Company`.
- No trace of the two left-out sentences, and nothing added in their place.

## 6. Scenario 2: Local market (Vietnam)

**Story:** HEINEKEN Vietnam announces the second phase of its water conservation programme with the government and WWF. The same agent now writes for the **local market** newsroom, with that site's own settings, under the same brand rules.

**Input:** `scenario-2-vietnam-water-programme.docx` (real release, English translation).

### Run it

**Step 1.** Start a **new chat** with **HEINEKEN Newsroom Story Writer**.

**Step 2.** Attach `scenario-2-vietnam-water-programme.docx` and type:

```text
Write a news story from the attached press release.
```

**Step 3.** Walk through the fact sheet. Point out:

- The **figures kept exactly**: more than 2.2 billion litres a year, VND 70 billion over nine years (2022–2030), five breweries.
- **Names and titles as given:** Wietse Mutters, Managing Director of HEINEKEN Vietnam; Nguyen Do Anh Tuan, Director General of the Department of International Cooperation, Ministry of Agriculture and Environment.
- The **2030 goal stays an ambition**; it is never written as achieved.

**Step 4.** Answer the questions:

| Question | Answer | Talk track |
|---|---|---|
| Which newsroom? | **`heineken-vietnam`, the local market site** (Recommended) | "Issued by HEINEKEN Vietnam with a Da Nang dateline, so the agent recommends the Vietnam newsroom. It uses that site's own subjects and settings." |
| Image | **No image** | As in scenario 1 |
| "HEINEKEN Vietnam realised this ambition in 2025…" (an ambition stated as achieved) | Choose the **compliant rewording** if it presents this as a result HEINEKEN Vietnam reported for 2025. Otherwise type: `Keep it, attributed to HEINEKEN Vietnam as a reported 2025 result.` | "The Brand Kit forbids stating ambitions as achieved. Here it is a real reported result, so the editor decides how to word it, and the agent follows." |
| "HEINEKEN Vietnam has pioneered…" (outside a quote) | **Leave it out** (Recommended) | "'Pioneer' is a claim without a source." |
| "… to pioneer and innovate …" inside Mr Mutters' quote, if asked | **Keep it as an attributed verbatim quote** | "Inside a named person's quote it can stay, word for word." |

The agent may ask about one or two other claims (for example the GDP and jobs figures in the closing paragraphs). Take the recommended option.

**Step 5. Draft review:** point out the SEO title ending in `| HEINEKEN Vietnam`, the counts and the checklist. Answer **Write it**.

**Step 6. Report:** click **Open in Page builder**.

### What good looks like

A tested run (12 November 2026) produced:

| Field | Value |
|---|---|
| Title | HEINEKEN Vietnam expands water conservation programme |
| Standfirst | HEINEKEN Vietnam has expanded its water conservation programme to support water security across five river basins. |
| Summary | HEINEKEN Vietnam is expanding its water conservation programme through 2030, aiming for 100% water balance at all five breweries nationwide. |
| SEO title | Water conservation programme expansion \| HEINEKEN Vietnam (57 characters) |
| Subjects | Corporate, Sustainability (the Vietnam site's own items) |
| Date | 8 September 2026 |
| Body | Starts "Da Nang, 8 September 2026 – …", both quotes verbatim, about 3,000 characters |

Wording differs slightly between runs; facts, figures and quotes do not.

## 7. Showing the result

1. Click **Open in Page builder** in the agent's report. The page opens on the right site and version.
2. Show the **headline, standfirst and body** on the page.
3. Show the page's **SEO and social fields** (metadata title, description, keywords, Open Graph title and description) in the page's content fields: all filled, within their limits. Find where your Pages version shows them during the dry run.
4. Optional: open `/newsroom/2026` in Pages to show the story next to the site's existing news.
5. Close with: "The agent created a draft. An editor reviews it here and publishes through the normal process."

**Never publish the demo pages.** Neither site has a workflow, so a site publish would put them live. Scenario 1 is fictional.

## 8. Reset after the demo

Delete the pages the demo created so the next demo starts clean:

| Site | Where | Page to delete |
|---|---|---|
| `heineken` | `/newsroom/2026` | The going-out study story (for example `cambodian-study-finds-changing-going-out-habits`) |
| `heineken-vietnam` | `/newsroom/2026` | The water programme story (for example `heineken-vietnam-expands-water-conservation-programme`) |

Delete **only** these pages. Leave the year pages, the other stories (including the existing `New page` items) and everything else untouched.

If you skip the reset, the next run asks whether to update the existing page. Choosing **Update it as a new version** works, and is itself a good thing to demo once.

## 9. Troubleshooting

| What happens | What to do |
|---|---|
| "The Marketer MCP is not available to this agent" | Agent → **Tools & skills** → turn **Marketer MCP** on, save, start a new chat |
| "This agent is misconfigured: the … skill is not attached" | Agent → **Tools & skills** → attach the skill **HEINEKEN Newsroom Story Writer**, save, start a new chat |
| "The Brand Kit 'The HEINEKEN Company' is not published" | Publish the Brand Kit, start a new chat |
| "There is no year page for 2026 …" | Create the News Year page `2026` under `/newsroom` on that site (copy the settings of 2025), then run again |
| The agent asks whether to update an existing page | A previous run left its page: choose **Update it as a new version**, or reset and start again |
| The attached file is not read | Open the Word file, copy all the text, and paste it after `Write a news story from this press release:` |
| The agent rejects an image | By design: placeholder images (names with `dummy` or `placeholder`) are refused. Choose **no image** |
| No **Open in Page builder** link | Open Pages → the site → `/newsroom/2026` → the new story |
| The conversation goes off track | Start a new chat and run the scenario again. Nothing is written before your final approval |

## 10. Questions the audience may ask

| Question | Answer |
|---|---|
| Does it publish? | Never. It creates or updates one draft page and stops. |
| Where do the facts come from? | Only from the release and the presenter's answers. It does no web research; web search is used only to read a URL the presenter gives. Missing information is reported as a gap. |
| Can it write in Vietnamese or other languages? | It reads any language and writes English. Local-language versions are a possible next step. |
| Can it add more markets? | Yes: each new market site is added to the agent's site settings (its newsroom, subject items and SEO suffix). |
| Can it use images? | Yes, when the editor names an approved image from the media library. It never generates or picks images on its own. |
| What else can it take as input? | Pasted text, a URL, or bullet-point notes. With short notes it writes a short story and never pads it. |
