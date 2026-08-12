<!-- push-window: early -->
<!-- push-status: active -->

# Enrollment push — the early window

Send-ready outbound copy for the push before the **first tuition window closes at
the end of Saturday, August 15, 2026**. After that date the tuition is $1,850 and
every price below is wrong.

This file is machine-checked. `tests/tuition-window.mjs` reads the two HTML
comments at the top: while `push-status` is `active`, the window named in
`push-window` must still be the live one, and the suite **fails** the day it
isn't. That failure is the feature — it means send-ready copy is sitting in the
repo quoting a closed window. Rewrite it for the next window, or set
`push-status` to `retired`.

Every price and date below is checked against what `index.html` actually prints.
Nothing here may quote a number the site does not.

---

## Read this before you send anything

**The payment method is not decided.** No method appears anywhere on the site,
and `docs/seat-request-replies.md` names this as the blocking item for template A.
A push works by producing replies. If you send it today, requests arrive today,
and the honest answer to *"how do I pay you?"* has to exist before the first one
lands — not after.

This is a hard gate, and the calendar below is built around it, but it is a
15-minute decision, not a project. Pick the method, write the one paragraph that
goes in template A, then send.

**The deadline lands on a Saturday.** August 15 is a Saturday and September 5 is
a Saturday too. Tuition is set by the date a **completed payment is received** —
so if the method you choose only clears on business days, then for anyone
deciding on Friday afternoon the real deadline is Friday, not Saturday. Two
honest ways to handle it, pick one and say it the same way everywhere:

- Choose a method that completes instantly on a weekend, and the printed date
  stands as printed; or
- State plainly in replies that payment must be **initiated** by a date that
  lets it complete by August 15.

Do not leave this ambiguous and sort it out per person. That is how two people
who paid the same day end up charged different tuition.

---

## What is true, and where it comes from

Every claim in the copy below is printed on the site. Nothing else is.

| Fact | As the page prints it |
|---|---|
| Dates | September 18–20, 2026 |
| Place | Tenafly, New Jersey (exact venue shared with enrolled learners) |
| Hours | Friday 6:00–9:00 PM, Saturday and Sunday 9:00 AM–5:00 PM |
| Teaching time | 16 live instructional hours across 19 hours on site |
| Audience | Confident everyday laptop users, new to AI. No coding or command line |
| Requirement | A laptop, a charger, an active ChatGPT Plus subscription (cost separate from tuition) |
| Early tuition | $1,500 — Through August 15, 2026 |
| Next tuition | $1,850 — August 16 through September 5, 2026 |
| Full tuition | $2,250 — After September 5, 2026 |
| The rule | Your tuition is set by the date your completed payment is received |
| Certificate | AgentX Certificate of Completion — a private program record, not an academic credential, accreditation, or transferable college credit |

### What the push may never say

The site is deliberately free of these, and an email that adds them makes the
page look like the sanitised version rather than the true one.

- **No seat count.** "Small, high-touch cohort" is printed; a number is not, and
  no cap has been set. "Only 4 seats left" is not available to you.
- **No countdown, no urgency theatre.** The date does the work. The window is a
  real deadline with a real mechanism — that is enough.
- **No testimonials, ratings, or past-cohort results.** There is no prior cohort.
- **No university affiliation.** Adam teaches independently through AgentX. The
  page carries the non-affiliation disclaimer; nothing outbound may imply
  otherwise, including by listing MIT executive study next to the program name.
- **No promised outcomes.** The take-home rack describes what you build, not what
  results you will get.
- **No claim that writing in holds anything.** Requesting a seat reserves no seat
  and locks no price. Say it in every message that names a price.

---

## Send calendar

Today is Wednesday, August 12. The window closes at the end of Saturday,
August 15. That is four days, and the two highest-yield sends are the two
personal ones.

| When | Do | Asset |
|---|---|---|
| Wed Aug 12, AM | **Decide the payment method** and write it into template A | blocker |
| Wed Aug 12, PM | One-to-one notes to the warmest 15–30 names, sent individually | Push 1 |
| Thu Aug 13, AM | Broadcast email to the full list | Push 2 |
| Thu Aug 13, midday | LinkedIn post | Push 3 |
| Fri Aug 14 | Short direct messages to anyone who replied but has not paid; last weekday for any payment rail that needs a business day | Push 4 |
| Sat Aug 15, AM | Last call, **only** to people already in conversation | Push 5 |
| Sun Aug 16 | Window has flipped. Retire this file. Reply templates now quote $1,850 | — |

Run `node tests/tuition-window.mjs` on each send morning. It prints the window
that is live that day and the price you are allowed to quote.

---

## Push 1 — one-to-one (highest yield)

Sent individually, one recipient per message, with a real first line. This is
the send that fills the room; the broadcast is the backstop. If you only have
time for one thing on this list, do this one.

> **Subject:** Something I'm teaching next month
>
> Hi [NAME],
>
> [ONE SPECIFIC LINE ABOUT THEM — the goal they mentioned, the tool they were
> fighting with, the thing they said they never got around to. If you can't
> write this line, this person belongs in the broadcast instead.]
>
> I'm teaching a weekend intensive on directing AI agents — September 18–20 in
> Tenafly. It's built for people who use a laptop confidently and are new to
> this, so no coding and no command line. Friday evening plus two full days:
> 16 live instructional hours.
>
> The part I think you'd actually use: you bring one real goal you've been
> meaning to make progress on, and you spend the weekend turning it into a
> reviewed, useful result — with the checking step built in, so you can tell
> when the output is wrong. You leave with the method, not with notes.
>
> Tuition is $1,500 if payment is completed through August 15; after that it's
> $1,850. It goes by the date payment is received, so I'd rather tell you now
> than have you find out on the 16th.
>
> [PAYMENT INSTRUCTIONS — one sentence, the method you decided on.]
>
> Details are at https://abehrman.github.io/agentic-ai-weekend/ — and if it's not
> for you, no need to reply, I won't chase it.
>
> Adam

## Push 2 — broadcast email

For the full list. Same facts, no fake intimacy, and an unsubscribe that works.

> **Subject:** Agentic AI Weekend, September 18–20 — early tuition ends Saturday
>
> Hi [NAME],
>
> I'm running Agentic AI Weekend in Tenafly, New Jersey on September 18–20 — an
> in-person beginner intensive on directing AI agents, for confident everyday
> laptop users. No coding or command line required.
>
> **What it is.** Friday, September 18 from 6:00 to 9:00 PM, then Saturday and
> Sunday, September 19 and 20, each 9:00 AM to 5:00 PM with a 90-minute lunch —
> 16 live instructional hours across 19 hours on site. You bring one real goal,
> and you work on that goal all weekend.
>
> **What you practice.** Writing a brief an agent can actually serve. Reading the
> plan before the work starts. Deciding which tools an agent may touch. Checking
> the output before you act on it. Approving what an agent is allowed to remember.
> And releasing the result yourself — nothing goes out without your say.
>
> **What you leave with.** A one-page Personal Agent Map for your real goal, a
> configured assistant that reflects context you approved, a method for checking
> AI output, a safety and permissions checklist, a next-30-days plan, and the
> AgentX Certificate of Completion.
>
> **Tuition.** $1,500 through August 15 — that's $750 under full tuition. From
> August 16 it's $1,850. Your tuition is set by the date your completed payment
> is received, not by when you write to me, so writing in doesn't hold a price.
>
> You'll need a laptop, a charger, and an active ChatGPT Plus subscription for
> the course path (its cost is separate from tuition).
>
> Everything, in full: https://abehrman.github.io/agentic-ai-weekend/
> Or just reply to this email and I'll send enrollment and payment details.
>
> Adam
>
> Adam Behrman · AgentX · adam.behrman@gmail.com
> [UNSUBSCRIBE LINK — required, and it must work]

## Push 3 — LinkedIn

No hook-and-cliffhanger formatting, no "🚨", no engagement bait. The audience
overlaps with people who have watched Adam be credible about risk and controls
for years; the post should sound like the same person.

> Most people I talk to have used AI and come away unsure whether they can trust
> what it gave them. That's the actual gap — not access to the tools.
>
> So I'm teaching a weekend on it. September 18–20, in person in Tenafly, New
> Jersey. 16 live instructional hours, built for confident everyday laptop users
> who are new to directing AI. No coding, no command line.
>
> You bring one real goal — not a toy exercise — and you spend the weekend
> turning it into something you've actually checked: writing a brief the agent
> can serve, reading its plan before it works, deciding which tools it may touch,
> catching the claims it can't support, and releasing the result yourself.
>
> That last part is the whole point. Nothing leaves without your approval.
>
> I spent years as a Chief Model Risk Officer deciding whether a model's output
> was good enough to act on. This is that discipline, made usable by someone who
> doesn't want a career in it.
>
> Small cohort, in person, hands on the whole way through. Early tuition is
> $1,500 through August 15; it goes to $1,850 after that, set by the date payment
> is received.
>
> Details and the schedule: https://abehrman.github.io/agentic-ai-weekend/
>
> #AI #AgenticAI

**If you post a second time before the window closes**, post something useful
rather than a reminder — one concrete idea from the weekend, with the deadline
as the last line. A reminder-only post is the one that costs you credibility.

## Push 4 — short direct message

Text, WhatsApp, or LinkedIn DM, to people already in conversation. Short on
purpose.

> Hi [NAME] — the early tuition for the September 18–20 AI weekend runs through
> Saturday ($1,500, then $1,850). It goes by when payment is received, so I
> didn't want you to miss it by a day. Details:
> https://abehrman.github.io/agentic-ai-weekend/ — happy to answer anything.

## Push 5 — Saturday last call

**Only** to people who have already replied or asked a question and have not
paid. Sending this to a cold list on the last morning is the move that makes the
whole push read as pressure.

> **Subject:** Re: Agentic AI Weekend — today is the last day at $1,500
>
> Hi [NAME],
>
> Short note: today is the last day for $1,500 tuition. Payments completed
> through the end of today are $1,500; from tomorrow it's $1,850.
>
> [PAYMENT INSTRUCTIONS.]
>
> If the timing doesn't work, that's a fine answer — the program runs either way
> and I'd rather you come when it's right than rush it for a number.
>
> Adam

---

## What happens when the window flips

On **Sunday, August 16**, without anyone touching the site:

- The page's current-window marker moves to $1,850 on its own (`script.js`
  computes it in America/New_York — see `tests/window.test.mjs`).
- Every price in this file becomes wrong.
- `docs/seat-request-replies.md` template A must quote $1,850 and name
  September 5 as the next boundary.
- Anyone who received Push 1–5 and has not paid moves to **template B** in the
  reply doc, with the September 5 boundary.

To retire this file: set `push-status` to `retired` at the top, or rewrite it for
the mid window and set `push-window` to `mid`. The test suite will tell you if
you forget.

---

## Not yet decided

Carried from `docs/seat-request-replies.md`, listed here only where it changes
what the push can say:

- **Payment method** — blocks every send. See the gate at the top.
- **Reply SLA** — the push creates a burst of inbound; decide what you promise
  and whether you can hold it over a weekend.
- **Cohort cap** — until a number exists, no scarcity claim of any kind is
  available, in any channel.
- **Refund and transfer policy** — the first person to ask will ask *before*
  paying, and a deadline push makes that question more likely, not less.
- **Where requesters are recorded** — a four-day push with no capture list is how
  a request gets lost between an inbox and a weekend.

## Before each send

- [ ] `node tests/tuition-window.mjs` — confirms today's live window and price.
- [ ] Payment instructions are real and written into the message.
- [ ] Every `[PLACEHOLDER]` replaced.
- [ ] The message says, in some form, that writing in does not reserve a seat or
      lock a price.
- [ ] No seat count, no countdown, no testimonial, no university implication.
- [ ] Push 1 and Push 5 go to individuals, one message each — not a bcc block.
