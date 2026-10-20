# Rich text format

Allowed tags only: `h2`, `h3`, `p`, `ul`, `li`, `strong`, `a`. No inline styles, classes, images or tables. Keep the file's order and wording; shorten only by removing words, never by changing numbers.

## `ArticleKeyTakeaways`: highlight sections

One `h3` per theme in the file (for example *Growth*, *Profitability*, *Capital Efficiency*, *Strategy*), each followed by a `ul` of short bullets.

```html
<h3>Growth: Premium and LoNo leading the portfolio</h3>
<ul>
<li>Total volume increased 2.4%; consolidated volume grew 1.1% and licensed volume up 19.8%.</li>
<li>Premium grew 8%, beyond beer up 10%, and low- and no-alcohol 15% higher.</li>
</ul>
<h3>Profitability: Third consecutive year of margin expansion</h3>
<ul>
<li>Operating profit grew 7.9%; operating profit margin expanded 70 bps to 15.3%.</li>
</ul>
```

## `ArticleContent`: outlook

Start with `<h2>Outlook YYYY</h2>`, then one introduction paragraph and a list of guidance items with the metric in `<strong>`. Always end with the download sentence.

```html
<h2>Outlook 2027</h2>
<p>We expect a gradually improving consumer environment in most of our markets. For 2027 we anticipate:</p>
<ul>
<li><strong>Operating profit</strong> to grow between 4% and 8%.</li>
<li>An <strong>effective tax rate (ETR)</strong> of around 27.5%.</li>
</ul>
<p>The full press release is available for download below.</p>
```

## `ConferenceCallDetails`

Start with `<h2>Conference call details</h2>`: one paragraph with time and access, a list of dial-in numbers, and a paragraph with the password, if the file has them.

```html
<h2>Conference call details</h2>
<p>HEINEKEN will host an analyst and investor conference call today at 10:00 CET / 09:00 GMT. A replay will be available after the call.</p>
<ul>
<li>United Kingdom (Local): 020 3936 0000</li>
<li>Netherlands (Local): 085 888 0000</li>
</ul>
<p>Participation password for all countries: 210227</p>
```
