# Spice Census: design document (DRAFT v0.1)

> Status: draft. Items marked **OPEN** need a decision before we build.

## 1. Goal

Measure **general trends in kinkiness** (attitudes, interest, experience) in the
adult population over **3 to 5 years**, using an anonymous, short, fun survey
that people want to share.

- This is a survey first. The result at the end is a reward that makes people share it.
- It covers broad dimensions and a few mainstream activities. It is not a full kink inventory like the BDSM test.
- It works for every gender, sex and orientation: no gendered or orientation-specific wording.
- It collects as little data as possible: coarse demographics only, nothing identifying.

### Non-goals
- User accounts, profiles or saved results.
- Tracking individuals across years (see §6).
- Claims about prevalence in the population as a whole (see §8).

## 2. Name

Working title: **Spice Census**. The word "census" signals a recurring count, and "spice" is safe
to post on social platforms (which often block or shadow-ban "kink"). Alternatives:
*Kinkometer*, *The Curio Census*, *Spectrum of Spice*, *Kinkship*. **OPEN**

## 3. User flow

1. **Landing**: what this is, how long it takes (about 6 minutes), anonymity promise, link to the privacy policy.
2. **Age gate**: "Are you 18 or older?" Answering No ends the survey and stores nothing.
3. **Consent**: explicit checkbox for processing data about sex life (GDPR Art. 9(2)(a)).
4. **Demographics**: about 7 questions. Every question has "Prefer not to say".
5. **Core scale**: about 20 Likert items (frozen across years, see §5).
6. **Mainstream activities**: about 10 items (Tried / Curious / Not for me).
7. **Meta**: "Taken this before?" and "Where did you hear about it?"
8. **Submit**, then the **Result page**, with a share card.
9. **Optional**: separate reminder-email signup (see §7).

Target: about 35 to 40 items in total, under 7 minutes, mobile first.

## 4. Questionnaire (draft)

### 4.1 Demographics (coarse on purpose)
| Field | Options |
|---|---|
| Age bracket | 18–24, 25–34, 35–44, 45–54, 55–64, 65+ |
| Gender identity | Woman, Man, Non-binary, Other, Prefer not to say |
| Trans experience | Yes / No / Prefer not to say **OPEN: include?** |
| Sexual orientation | Heterosexual, Gay/Lesbian, Bisexual/Pansexual, Asexual spectrum, Queer/Other, Prefer not to say |
| Relationship style | Single, Monogamous relationship, Non-monogamous/Open/Poly, Prefer not to say |
| Country | Country list (no region or city) |
| Kink community involvement | None, Online only, Occasional events, Active member |

### 4.2 Core scale (5-point Likert, from strongly disagree to strongly agree)
Dimensions, about 3 items each. These items also power the result:
- **Openness / curiosity**: interest in exploring new things sexually.
- **Power exchange: lead**: enjoys being in control.
- **Power exchange: follow**: enjoys giving up control.
- **Sensation**: interest in intense sensation (giving or receiving).
- **Fantasy & roleplay**
- **Exhibition / voyeur**
- **Self-label**: "I consider myself kinky" (single item, our main trend variable).

### 4.3 Mainstream activities (Tried / Curious / Not for me)
Light bondage, blindfolds, spanking, dirty talk, roleplay, toys, hair pulling,
dominance/submission dynamics, sex in semi-public places, consensual non-monogamy.

## 5. Questionnaire versioning (critical for a trend study)

Data from different years can only be compared if the questions stay the same.
- Every response stores `survey_version`.
- Core items (§4.2) are **frozen** after launch, including their order and wording.
- New questions can only be added in a clearly separated optional block.
- Every version gets a changelog in `docs/questionnaire/`.

## 6. Repeated cross-sections, not a panel

Responses are **never linked** to an email or to earlier responses. Each year is
a fresh snapshot. This is what lets us honestly call the data anonymous. The
"Taken this before?" question lets us split first-timers from returners during analysis.

## 7. Reminder emails

- A separate, optional form appears **after** the survey is submitted.
- Choice of frequency: every 6 months or yearly.
- **Double opt-in**: a confirmation link is sent before the address is stored as active.
- Every email contains a one-click unsubscribe link. Unsubscribing deletes the address.
- Content is limited to "the new survey round is open" plus the link. Nothing else.
- Stored in a **separate table** with no foreign key to responses.
- To stop anyone linking a signup to a response by timing, responses store
  only `submitted_month` (YYYY-MM), not an exact timestamp.
- Sending: a Vercel Cron job (daily) plus an email provider free tier (e.g. Resend).

## 8. Data quality & bias

- **Self-selection**: people who share kink surveys are kinkier than average.
  Report results as trends within the sample, and use the "where did you hear about it?"
  question to watch for shifts in where respondents come from.
- **Bots**: Cloudflare Turnstile (free, no cookies), a minimum completion time,
  one attention-check item, and rate limiting.
- **Duplicates**: no IP storage, so we accept some noise and flag fast or straight-lined responses.

## 9. Privacy & legal

- No IP addresses, user agents, cookies or third-party analytics are stored, so no cookie banner is needed.
- No free-text fields (they invite identifying info).
- Hosting in the EU (Vercel function region `fra1`, database in an EU region). **OPEN: where are you based?**
- A privacy policy that names the controller, purpose, legal basis (Art. 9(2)(a)) and retention period.
- Responses are anonymous, so deleting a single response on request is not possible. The policy has to say this.
- An Impressum may be required (Germany/Austria).
- Content note on the landing page, and links to support resources.

## 10. Tech stack (proposal)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)**, TypeScript | **OPEN: Next.js vs NestJS** |
| Hosting | Vercel Hobby (free, non-commercial) | |
| Database | Neon Postgres free tier | Supabase free tier pauses after inactivity |
| ORM | Drizzle | Lightweight, works on serverless |
| Email | Resend free tier | 3k/month |
| Bot protection | Cloudflare Turnstile | |
| Share image | `next/og` (generated OG image) | |

### Data model (sketch)
```
responses(id uuid, survey_version, submitted_month, answers jsonb, flags jsonb)
reminder_subscribers(id uuid, email, frequency, confirmed_at, next_send_at, unsubscribe_token)
```

## 11. Result ("reward")

**OPEN**: choose one:
- **Archetypes**: e.g. "The Curious Explorer", "The Sensation Seeker", "The Vanilla Connoisseur".
  Very shareable, but less informative.
- **Spice profile**: radar chart of the 6 dimensions plus an overall "spice level".
- Both: archetype headline with the radar chart below.

The result is computed in the browser and is not stored. The share card shows only what the user chooses to share.

## 12. Open questions

1. Next.js or NestJS?
2. Where are you based, and what is the target audience/language(s)?
3. Result style (archetype / radar / both)?
4. Name?
5. Should aggregated (or anonymised raw) data be published openly each year?
6. Survey "rounds" (e.g. open every January) or always open?
