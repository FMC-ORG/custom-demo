# FY 2026 Results: field values to copy and paste

Demo content with invented figures. One block per field. For the Rich Text fields, open the field's **HTML / source view** in Pages and paste the HTML.

Create the page first: **Newsroom → Add page → Press Release Page Template**, name `FY 2026 Results`.

---

## Title

```
HEINEKEN N.V. reports 2026 full year results
```

## ReleaseType

```
Regulatory news
```

## ReleaseLocation

```
Amsterdam
```

## ReleaseTime

```
07:00 CET
```

## ArticlePublicationDate

Pick **10 February 2027** in the date picker.

```
10/02/2027
```

## ArticleReadTime

```
6 min read
```

## ReleaseSubheadline

```
Record premium growth and margin expansion as EverGreen 2030 delivers ahead of plan
```

## ArticleKeyTakeaways (Rich Text, paste as HTML)

```html
<h3>Growth: Premium and LoNo leading the portfolio</h3>
<ul>
<li>Total volume increased 2.4%; consolidated volume grew 1.1% and licensed volume up 19.8%.</li>
<li>Heineken® volume up 6.1%, with double-digit growth in Brazil, Vietnam and South Africa.</li>
<li>Premium grew 8%, beyond beer up 10%, and low- and no-alcohol 15% higher.</li>
<li>Net revenue growth of 4.1%, with growth in all four regions.</li>
</ul>
<h3>Profitability: Third consecutive year of margin expansion</h3>
<ul>
<li>Operating profit grew 7.9%; operating profit margin expanded 70 bps to 15.3%.</li>
<li>Diluted Earnings per Share (EPS) of €4.86, up 12.4% (2025: €4.32).</li>
<li>Gross savings of €540 million, ahead of the €400–500 million annual target.</li>
</ul>
<h3>Capital Efficiency: Strong cash returns to shareholders</h3>
<ul>
<li>Free Operating Cash Flow of €3.2 billion, a cash conversion ratio of 102%.</li>
<li>€1.5 billion share buyback programme completed.</li>
<li>Proposed total dividend of €1.92 per share, up 9%.</li>
</ul>
<h3>EverGreen 2030: Ahead of plan</h3>
<ul>
<li>60+ innovations launched, contributing 7% of net revenue.</li>
<li>Digital B2B platforms now serve 750,000 customers in 30 markets.</li>
<li>Renewable energy reached 78% of thermal energy across production sites.</li>
<li>FY2027 operating profit growth guidance of 4% to 8%.</li>
</ul>
```

## ReleaseQuote

```
2026 was a year of disciplined execution. We grew volume ahead of our markets, expanded margins for the third consecutive year and delivered our productivity programme earlier than planned. Our premium portfolio and our low- and no-alcohol brands are now growing at twice the pace of the total business. We enter 2027 with momentum, a stronger balance sheet and a clear focus on the consumers and customers who make HEINEKEN the world's most international brewer.
```

## ArticleAuthor (quote author)

Pick the People item. If it doesn't exist yet, create it under `Data/People` with these values:

personFirstName
```
Marieke
```
personLastName
```
de Vries
```
personJobTitle
```
Chief Financial Officer
```

## ArticleContent (Rich Text, paste as HTML)

```html
<h2>Outlook 2027</h2>
<p>We expect a gradually improving consumer environment in most of our markets and remain confident in the continued execution of EverGreen 2030. For 2027 we anticipate:</p>
<ul>
<li><strong>Operating profit</strong> to grow between 4% and 8%.</li>
<li><strong>Gross savings</strong> of around €500 million, offsetting most of the expected input cost inflation.</li>
<li>An <strong>average effective interest rate</strong> of around 3.4%.</li>
<li>An <strong>effective tax rate (ETR)</strong> of around 27.5%.</li>
<li><strong>Capital expenditure</strong> below 7.5% of net revenue.</li>
</ul>
<p>The full press release is available for download below.</p>
```

## ConferenceCallDetails (Rich Text, paste as HTML)

```html
<h2>Conference call details</h2>
<p>HEINEKEN will host an analyst and investor conference call in relation to its 2026 Full Year results today at 10:00 CET / 09:00 GMT. The call will be audio cast live via the company's website. A replay will be available after the call.</p>
<ul>
<li>United Kingdom (Local): 020 3936 0000</li>
<li>Netherlands (Local): 085 888 0000</li>
<li>USA: 1 646 233 0000</li>
</ul>
<p>Participation password for all countries: 210227</p>
```

## ReleaseDownload (General Link)

Link text:
```
Download the 2026 Full Year Results (PDF)
```
URL (external, open in new window):
```
https://ffde.sitecoresandbox.cloud/api/public/content/97107-heineken-nv-2026-q3-trading-update?v=3f26d088
```

## ArticleImage

Pick `q3-star-card` from Content Hub.

---

## Page metadata

baseMetadataTitle
```
HEINEKEN N.V. 2026 Full Year Results
```

baseMetadataDescription
```
HEINEKEN N.V. reports 2026 full year results: 2.4% volume growth, operating profit up 7.9% and a proposed total dividend of €1.92 per share.
```

baseOgDescription
```
Record premium growth and margin expansion as EverGreen 2030 delivers ahead of plan
```

NavigationTitle
```
FY 2026 Results
```

---

## Optional: Key figures strip (open area)

Add **TrustStatsRow**, variant **HeinekenMarkets**, with a new datasource:

Title
```
Key figures
```
EyebrowText
```
FY 2026
```

| StatValue | StatLabel |
|---|---|
| `+2.4%` | `Total volume growth` |
| `+7.9%` | `Operating profit growth` |
| `€4.86` | `Diluted EPS, up 12.4%` |
| `€1.92` | `Proposed total dividend` |

## Optional: Newsroom card

Add a child to **Heineken - Newsroom Releases**:

CardTitle
```
FY 2026 Results
```
CardDescription
```
10 Feb 2027
```
CardImage: `q3-star-card` · CardLink: the new `FY 2026 Results` page.
