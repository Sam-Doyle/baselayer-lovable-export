# Email Specifications

## Template Standards

| Spec | Standard |
|------|----------|
| Width | 600px max (Klaviyo default) |
| CSS | Inline styles only (only method that works everywhere) |
| Max email size | <102KB (Gmail clips above this) |
| Image width | Max 600px display; 1200px retina |
| Fonts | Web-safe fallback required (Arial, Helvetica, Georgia) |
| Images | Include alt text; assume blocked by default |

## Dark Mode Considerations

| Client | Behavior | Recommendation |
|--------|----------|----------------|
| Apple Mail | Full media query support | Use @media (prefers-color-scheme: dark) |
| Gmail | Mostly leaves colors alone | Test thoroughly; limited control |
| Outlook | Unreliable inversion; Word engine | Use !important overrides; light shadow on dark logos |
| All clients | White text on transparent BG ghosts out | Always use solid fill background on buttons/CTAs |

## Klaviyo Merge Tags

| Tag | Output |
|-----|--------|
| `{{ first_name }}` | Subscriber first name |
| `{{ last_name }}` | Subscriber last name |
| `{{ person.email }}` | Email address |
| `{{ event.product_name }}` | Event-triggered product (flows only) |
| `{{ organization.name }}` | Company name |
| `{{ organization.url }}` | Company URL |
| `{{ item.price\|floatformat:2 }}` | Price with 2 decimals |

Tags are case sensitive. Profile: `person.`, events: `event.`, org: `organization.`. Filters use pipe syntax.

## Mailchimp Merge Tags

| Tag | Output |
|-----|--------|
| `*\|FNAME\|*` | First name |
| `*\|LNAME\|*` | Last name |
| `*\|EMAIL\|*` | Email address |
| `*\|IF:FNAME\|*` ... `*\|END:IF\|*` | Conditional block |
| `*\|LIST:NAME\|*` | List/audience name |
| `*\|UNSUB\|*` | Unsubscribe link |

Always set default merge values for missing data (e.g., "Friend" for empty FNAME).

## Deliverability Requirements

| Requirement | Standard |
|-------------|----------|
| SPF | Required; publish DNS TXT record |
| DKIM | Required; 2048-bit keys (2025 default) |
| DMARC | Required; start at p=none, tighten to reject |
| Spam complaint rate | <0.3% (Google/Microsoft/Yahoo) |
| One-click unsubscribe | Required (2025 sender requirements) |
| Volume threshold | >5,000 emails/day triggers mandatory compliance |
| Inbox placement (authenticated) | 85-95% |
| Authenticated senders advantage | 2.7x more likely to reach inbox |
| List verification | Before every major campaign; monthly minimum |

## Performance Benchmarks (DTC Skincare)

| Flow Type | Open Rate | Click Rate | Conversion Rate | RPR |
|-----------|-----------|------------|-----------------|-----|
| Welcome Series | 45-50% | 8-12% | 8-12% | $2.35-$3.34 |
| Abandoned Cart | 39% | 23.33% | 10.7% | $3.65 |
| Browse Abandonment | 30-35% | -- | 3-5% | $1.07 |
| Post-Purchase | 40-45% | -- | 10-15% repeat | $0.41 |
| Win-Back | 25-30% | -- | 5-8% reactivation | -- |

Campaign RPR avg: $0.10. Flow RPR avg: $1.94 (18-22x campaigns). Flows drive 41% of email revenue from 5.3% of sends.

## List Health Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| List growth rate (monthly) | 3-5% | 2-3% | <2% |
| Unsubscribe rate | <0.20% | 0.20-0.35% | >0.40% |
| Spam complaint rate | <0.10% | 0.10-0.30% | >0.30% |
| Bounce rate | <2% | 2-5% | >5% |

## Spam Trigger Words to Avoid

**High-risk:** "make money fast," "100% free," "guaranteed," "no cost," "act now," "instant weight loss," "miracle pill," "cure," "limited time"
**Formatting red flags:** ALL CAPS subjects, excessive exclamation marks (!!!), excessive emojis in subject lines
**Safe approach:** Write naturally. One or two urgency words with good sender reputation is fine. Modern ML filters weigh context over individual words.
