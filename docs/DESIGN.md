# Spice Census: design document (DRAFT v0.2)

> Status: draft. Items marked **OPEN** need a decision before we build.

## 1. Goal

Measure **general trends in kinkiness** (attitudes, interest, experience) in the
adult population over **3 to 5 years**, using an anonymous, short, fun survey
that people want to share.

- This is a survey first. The result at the end is a reward that makes people share it.
- The target group is **everyone**, not just kinky people. Couples who want to find out
  "how spicy are we?" are an explicit target group.
- It covers broad dimensions and a few mainstream activities. It is not a full kink inventory like the BDSM test.
- It is **inclusive by default**: no gendered or orientation-specific wording, and trans
  and non-binary people are explicitly represented in the demographics.
- It collects as little data as possible: coarse demographics only, nothing identifying.
- The survey is **always open**. There are no rounds.

### Non-goals
- User accounts, profiles or saved results.
- Claims about prevalence in the population as a whole (see §9).

## 2. Name

Working title: **Spice Census**. The word "census" signals a recurring count, and "spice" is safe
to post on social platforms (which often block or shadow-ban "kink"). Alternatives:
*Kinkometer*, *The Curio Census*, *Spectrum of Spice*, *Kinkship*. **OPEN**

## 3. User flow

1. **Landing**: what this is, how long it takes (about 6 minutes), anonymity promise,
   a content note, a language switcher and a link to the privacy policy.
2. **Age gate**: "Are you 18 or older?" Answering No ends the survey and stores nothing.
3. **Consent**: explicit checkbox for processing data about sex life
   (GDPR Art. 9(2)(a)). The survey cannot start without it.
4. **Demographics**: about 8 questions. Every question has "Prefer not to say".
5. **Core scale**: about 20 Likert items (hard-coded and frozen, see §5).
6. **Activities**: about 12 items (Tried / Curious / Not for me).
7. **Meta**: "Taken this before?", "Taking this with a partner?", "Where did you hear about it?"
8. **Self-assessment**: "Do you think you are kinky?" (1–5). This is asked last, **before** the
   result is shown, so we can compare how people see themselves with what the answers show.
9. **Optional returning code** (default off, see §6).
10. **Submit**, then the **Result page** (see §8).
11. **Optional**: separate reminder-email signup (see §7).

Target: about 40 items in total, under 7 minutes, mobile first.

## 4. Questionnaire (draft)

### 4.1 Demographics (coarse on purpose)
| Field | Options |
|---|---|
| Age bracket | 18–24, 25–34, 35–44, 45–54, 55–64, 65+ |
| Gender identity | Woman, Man, Non-binary, Genderfluid/Other, Prefer not to say |
| Trans | Yes / No / Prefer not to say |
| Sexual orientation | Heterosexual, Gay/Lesbian, Bisexual/Pansexual, Asexual spectrum, Queer/Other, Prefer not to say |
| Relationship style | Single, Monogamous relationship, Non-monogamous/Open/Poly, Prefer not to say |
| Country | Country list (no region or city) |
| Kink community involvement | None, Online only, Occasional events, Active member |

### 4.2 Core scale (5-point Likert, from strongly disagree to strongly agree)
Dimensions, about 3 items each. These items also power the radar chart:
- **Curiosity**: interest in exploring new things sexually.
- **Lead**: enjoys being in control.
- **Follow**: enjoys giving up control.
- **Sensation**: interest in intense sensation (giving or receiving).
- **Fantasy & roleplay**
- **Exhibition / voyeur**

### 4.3 Activities (Tried / Curious / Not for me)
Each item is tagged with one **interest category**, and those categories feed the
interest list on the result page:

| Item | Category |
|---|---|
| Light bondage / restraints | BDSM |
| Spanking / impact | BDSM |
| Dominance/submission dynamics | BDSM |
| Blindfolds / sensory play | Sensation |
| Hair pulling, biting, scratching | Sensation |
| Dirty talk | Verbal |
| Roleplay scenarios | Roleplay |
| Pet play | Roleplay |
| Toys | Toys |
| Sex in semi-public places | Exhibition |
| Watching / being watched | Exhibition |
| Consensual non-monogamy | Relationship |

### 4.4 Meta & self-assessment
- Taken this survey before? (No / Yes, once / Yes, several times)
- Taking this with a partner? (Alone / Partner is next to me / We each take it separately)
- Where did you hear about it? (Social media, Friend/partner, Kink community, Forum/Reddit, Other)
- "Do you think you are kinky?" (1 = Not at all … 5 = Very)

## 5. Questions are hard-coded, translations are pluggable

- All questions live in **one TypeScript file** (`src/survey/questions.ts`). Each has a
  stable ID (e.g. `core.follow.2`), a type, option IDs and a dimension or category tag.
  The code contains **no display text**.
- All display text comes from locale files (`messages/en.json`, `messages/de.json`, …)
  and is keyed by question and option ID. To add a language, add one file. A test
  checks that every locale has every key, and a locale missing keys is hidden from the language switcher.
- Library: `next-intl`. English is the source language, and German is included at launch.
- Answers are stored as **option IDs**, never as text, so all languages land in the same columns.
- Each response stores `survey_version` and `locale`. The locale is needed because a
  translation can change how a question is understood.
- **Freeze rule**: once launched, core and activity items are never changed or removed.
  A wording change counts as a new item with a new ID. Every change bumps
  `survey_version` and gets a changelog entry in `docs/questionnaire/CHANGELOG.md`.

## 6. Returning participants (optional, default off)

Most responses are independent snapshots. People who want to can opt in to a **returning code**,
so we can see how *the same person* changes over time without storing who they are.

**Concern with the proposed hash (name + birthday + place of birth):** a hash cannot be
reversed, but it *can* be recomputed by anyone who knows those three facts.
That includes a partner, an ex or a family member. The number of possible inputs is also small enough to brute-force
for a targeted person. That makes the code a pseudonym, so under GDPR the
data becomes **personal data about sex life** again, with all the obligations that brings
(access/deletion requests, probably a DPIA).

**Options** (**OPEN**, recommendation: A):

- **A. Random code (recommended).** The browser generates a code such as `MAPLE-OTTER-7342`.
  The person writes it down and enters it next time. We store only its hash.
  Because it is not based on anything about the person, nobody can recompute it.
  Downside: anyone who loses the code starts fresh, which is acceptable.
- **B. Self-generated code with deliberate collisions.** This is the standard method in
  longitudinal research: e.g. the 2nd letter of your mother's first name + your birth
  month + the last digit of your house number. Easy to remember. Many people share each code, so it
  points to a group, not a person. Matching is fuzzy, but it is easy to recall.
- **C. Hash of name + birthday + birthplace with a secret server key.** This protects
  against outsiders, but not against the operator or anyone who gets the key. Not recommended.

Whatever we choose: the code or hash is **never** included in released data (§10). Released data
only says "returning: yes/no", or contains already computed change values.

## 7. Reminder emails

- A separate, optional form appears **after** the survey is submitted.
- Choice of frequency: every 6 months or yearly.
- **Double opt-in**: a confirmation link is sent before the address is stored as active.
- Every email contains a one-click unsubscribe link. Unsubscribing deletes the address.
- Content is limited to "time to take it again" plus the link. Nothing else.
- Stored in a **separate table** with no foreign key to responses and no returning code.
- To stop anyone linking a signup to a response by timing, responses store
  only `submitted_month` (YYYY-MM). Monthly resolution is all the analysis needs.
- Sending: a daily Vercel Cron job plus an email provider free tier (e.g. Resend).

## 8. Result page (the reward)

The result is computed in the browser from the answers and is **not stored**.

1. **Archetype** headline with a short fun description, e.g. "The Curious Explorer",
   "The Sensation Seeker", "The Gentle Lead", "The Vanilla Connoisseur" (about 8 archetypes,
   chosen by the strongest dimensions plus the overall level).
2. **Radar chart** of the 6 dimensions plus an overall **spice level** (0–100).
3. **Your interest list**: the categories from §4.3, each marked as *explored*,
   *curious* or *not for you*, based on the answers. Next to it: "This test touched on: BDSM,
   sensation play, roleplay, pet play, …"
4. **Archetype gallery** (`/archetypes`): a public page that shows **all** archetypes.
   It is linked prominently on the result page ("See all archetypes"),
   so nobody retakes the test just to see the others.
5. **Share card**: an image generated with `next/og` that shows only the archetype and radar chart.

## 9. Data quality & bias

- **Self-selection**: people who share kink surveys are kinkier than average. The
  self-assessment question (§4.4) and "where did you hear about it?" help measure and
  correct for this. Results are reported as trends within the sample.
- **Bots**: honeypot field, a minimum completion time, one attention-check item and rate
  limiting at launch. Cloudflare Turnstile (free, no cookies) is built in behind a
  feature flag and gets switched on when spam shows up.
- **Duplicates**: no IP storage, so we accept some noise and flag fast or
  straight-lined responses. The archetype gallery removes the main reason to retake the test.

## 10. Data access

- **Monthly aggregation with a one-month lag**: a cron job on the 1st of each month
  aggregates the month before last. For example, on 1 March it publishes January.
- **Public**: aggregated statistics (charts on a `/results` page plus a CSV download).
- **Small-cell suppression**: a combination of filters (e.g. month × country × trans ×
  age) can contain a single person. Any aggregate cell with fewer than **10** responses is
  hidden or merged into a larger group.
- **Application-based raw data**: a form asks for name, email, institution (optional) and
  the reason. Requests are reviewed by hand. Approved requests get an export
  without returning codes, with the timestamp at month level only, and with rare categories merged.
  Request data is personal data (though not special category). It is kept for at
  most 1 year and covered in the privacy policy.

## 11. Privacy & legal (Germany / GDPR)

- No IP addresses, user agents, cookies or third-party analytics are stored, so no cookie banner is needed.
- No free-text fields in the survey.
- Hosting in the EU: Vercel function region `fra1`, database in an EU region.
- Privacy policy: names the controller, purpose, legal basis (Art. 9(2)(a)), retention period
  and the processors used (Vercel, Neon, Resend, Cloudflare).
- Responses without a returning code are anonymous, so deleting a single response on request is not possible.
  The policy has to say this.
- **Impressum / operator anonymity (OPEN)**: § 5 DDG probably applies to a public
  site like this, and GDPR Art. 13 requires naming a reachable controller in any case. The usual
  way to keep your home address private in Germany is a paid **Impressum/c-o address
  service** or a registered association (e.Verein) as operator. Please check this properly; this is not legal advice.
- Content note on the landing page, and links to support resources.

## 12. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)**, TypeScript | |
| i18n | next-intl | Locale files per language |
| Hosting | Vercel Hobby (free, non-commercial) | Cron included |
| Database | Neon Postgres free tier (EU) | Supabase free tier pauses after inactivity |
| ORM | Drizzle | Lightweight, works on serverless |
| Email | Resend free tier | 3k/month |
| Bot protection | Cloudflare Turnstile (feature flag) | |
| Charts | Recharts | Radar chart and results page |
| Share image | `next/og` | |

### Data model (sketch)
```
responses(id uuid, survey_version, locale, submitted_month, answers jsonb,
          returning_hash nullable, quality_flags jsonb)
reminder_subscribers(id uuid, email, frequency, confirmed_at, next_send_at, unsubscribe_token)
monthly_aggregates(month, survey_version, dimension_key, group_key, n, stats jsonb)
data_requests(id, name, email, institution, reason, status, created_at)
```

## 13. Open questions

1. Returning code: A (random code), B (self-generated code) or C (salted hash)?
2. Name?
3. Impressum solution (can be decided before going live; it does not block development).
