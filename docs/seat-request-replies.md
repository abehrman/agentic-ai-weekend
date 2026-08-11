# Seat-request replies and FAQ answers

Working copy of the receiving end of every CTA on the site. The page takes no
payment and holds no form: each button opens the same pre-addressed email, so
this file is the whole enrollment path after the click.

Two rules govern everything below.

1. **Quote only what the page says.** If a fact is not printed on the site, it is
   not settled — see [Not yet decided](#not-yet-decided). Placeholders are written
   as `[LIKE THIS]` and must be filled before a template is sent.
2. **Quote the window that is actually live**, not the one that was live when the
   template was written. Run `node tests/tuition-window.mjs` before a send day and
   it prints the current window and price.

## What arrives

Every CTA — hero, tuition rail, exit gate button, exit gate email link, footer —
opens the same message:

```
To:      adam.behrman@gmail.com
Subject: Agentic AI Weekend enrollment

Hi Adam,

I'm interested in the September 18-20 Agentic AI Weekend. Please send enrollment
and payment details.
```

The body is fixed, so a request carries a name and an email address and nothing
else. Anything you need to know about the person — their goal, their level, their
tooling — has to be asked for in the reply.

## Triage

| Step | Who | When |
|---|---|---|
| Watch `adam.behrman@gmail.com` for subject `Agentic AI Weekend enrollment` | Adam | Continuously |
| Record the requester (name, email, date received, window live on that date) | Adam | Same day |
| Send template A | Adam | Within `[SLA — 24h suggested]` |
| Log payment received + date, confirm the seat with template C | Adam | Same day as payment |
| Follow up on silence with template D | Adam | 5 days after A |

Record requests in the ClickUp list so the count is visible. What has to be
captured per requester: name, email, date requested, window live on that date,
reply sent, payment received date, tuition actually charged.

## Tuition windows

The date a **completed payment is received** sets the tuition. Requesting a seat
reserves nothing and locks nothing — say so in every reply that names a price.

| Window | Dates | Tuition |
|---|---|---|
| Early | Through August 15, 2026 | $1,500 |
| Standard | August 16 through September 5, 2026 | $1,850 |
| Full | After September 5, 2026 | $2,250 |

---

## Template A — first reply to a seat request

Send to every request. Names the live window and the rule behind it, asks the one
question that makes the weekend work.

> **Subject:** Re: Agentic AI Weekend enrollment
>
> Hi [NAME],
>
> Thanks for writing — glad you're interested.
>
> **The weekend.** Friday, September 18 from 6:00 to 9:00 PM, then Saturday and
> Sunday, September 19 and 20, each 9:00 AM to 5:00 PM with a 90-minute lunch.
> That is 16 live instructional hours across 19 hours on site, in Tenafly, New
> Jersey. I share the exact venue with enrolled learners.
>
> **Tuition.** [LIVE WINDOW PRICE] — [LIVE WINDOW DATES]. Your tuition is set by
> the date your completed payment is received, not by the date you write to me,
> so this reply does not hold a seat or a price for you. After [LIVE WINDOW END
> DATE] the tuition is [NEXT WINDOW PRICE].
>
> **To enroll.** [PAYMENT INSTRUCTIONS — method, payable to, reference to use].
> I'll confirm your seat by email the day the payment clears and send the
> pre-work then.
>
> **Two things to know before you commit.** The course path uses ChatGPT Plus, so
> an active subscription is required and its cost is separate from tuition. And
> you'll get more out of the weekend if you bring one real goal — a task you
> actually do, not a hypothetical. What would yours be?
>
> Happy to answer anything else.
>
> Adam
>
> Adam Behrman · AgentX
> adam.behrman@gmail.com

## Template B — window is about to close

Send only to people who have already received template A and have not paid. Send
it 3 to 4 days before a boundary — the boundaries are the end of **August 15** and
the end of **September 5**.

> **Subject:** Re: Agentic AI Weekend enrollment — tuition changes [DATE]
>
> Hi [NAME],
>
> Quick note rather than a nudge: the current tuition window closes at the end of
> [BOUNDARY DATE]. Payments completed through then are [CURRENT PRICE]; after
> that the tuition is [NEXT PRICE].
>
> Nothing else changes — same program, same small cohort, same weekend. Only the
> payment date changes the price.
>
> If you'd like to come, [PAYMENT INSTRUCTIONS]. If the timing doesn't work, just
> say so and I'll stop writing.
>
> Adam

## Template C — payment received, seat confirmed

> **Subject:** You're in — Agentic AI Weekend, September 18–20
>
> Hi [NAME],
>
> Payment received on [DATE], tuition [AMOUNT CHARGED]. Your seat is confirmed.
>
> **Where:** [FULL VENUE ADDRESS], Tenafly, New Jersey.
> **When:** Friday, September 18, 6:00–9:00 PM · Saturday, September 19,
> 9:00 AM–5:00 PM · Sunday, September 20, 9:00 AM–5:00 PM. Lunch is 90 minutes
> both full days.
>
> **Bring:** a laptop you're comfortable on, its charger, and one real goal you
> want to make progress on.
>
> **Set up before Friday:** an active ChatGPT Plus subscription on the account
> you'll use in the room.
>
> I'll send the pre-work and the parking and arrival details closer to the date.
> If anything changes on your end, tell me early and we'll sort it out.
>
> Adam

## Template D — no response after the first reply

> **Subject:** Re: Agentic AI Weekend enrollment
>
> Hi [NAME],
>
> Following up once on the September 18–20 weekend in case my last note landed at
> a bad moment. No pressure either way — if it's not the right time, saying so is
> a complete answer and I won't write again.
>
> If you're still thinking about it and something specific is in the way, tell me
> what it is. I'd rather answer the real question than send you more email.
>
> Adam

## Template E — the weekend is full

Hold until a cap is set — see [Not yet decided](#not-yet-decided).

> **Subject:** Re: Agentic AI Weekend enrollment — September cohort is full
>
> Hi [NAME],
>
> Thanks for writing. The September 18–20 cohort is full — it's deliberately
> small, and I'd rather say that plainly than squeeze the room.
>
> If you'd like, I'll put you first in line for [NEXT COHORT — DATE OR "the next
> one, date not yet set"] and write to you before it's announced anywhere else.
> Tuition for that cohort isn't set yet, so I'm not quoting you a price I might
> have to change.
>
> Adam

## Template F — the fit is wrong

For the person who describes themselves as an experienced engineer, or who wants
model training, MLOps, or agent deployment. Saying no here protects the room.

> **Subject:** Re: Agentic AI Weekend enrollment
>
> Hi [NAME],
>
> Thanks for the detail — it helps, and it makes me want to be straight with you.
>
> This weekend is built for confident everyday laptop users who are new to
> directing AI. From what you've described, you'd be ahead of where the room
> starts, and I don't think you'd get $[LIVE WINDOW PRICE] of value out of it.
>
> [IF APPLICABLE: What you're describing sounds closer to [ALTERNATIVE], which
> isn't what this is.]
>
> If I've misread that, tell me and I'll happily reconsider — you know your own
> gaps better than I do.
>
> Adam

---

## FAQ answers

Reply-ready versions of the six questions on the page, plus the ones people ask
that the page does not answer.

**Where exactly is it held?**
In Tenafly, New Jersey. I share the exact venue with enrolled learners — you'll
have the address as soon as your payment clears.

**What is the schedule?**
Friday, September 18 from 6:00 to 9:00 PM, then Saturday and Sunday, September 19
and 20, each 9:00 AM to 5:00 PM with a 90-minute lunch. 16 live instructional
hours across 19 hours on site.

**I am a true beginner. Is this for me?**
Yes — that's who it's built for. If you can manage browser tabs, uploads, and
copy and paste, you're ready. No coding or command line required.

**Do I need a paid AI subscription?**
Yes. An active ChatGPT Plus subscription is required for the standard course
path, and its cost is separate from tuition. Set it up before Friday on the
account you'll use in the room.

**What is the certificate?**
The AgentX Certificate of Completion, awarded after you complete the program.
It's a private program record — not an academic credential, not accreditation,
and not transferable college credit. I'd rather you know that up front.

**What does the enrollment button do?**
It opens a pre-addressed email to me asking for enrollment and payment details.
No payment is taken on the site. Sending it doesn't reserve a seat or a tuition
window — your completed payment date sets the tuition.

**What do I leave with?**
A Personal Agent Map, a safety and permissions checklist, and a next-30-days
launch plan — plus the certificate. The point is a method you can use again on
Monday, not notes from a weekend.

**Does requesting a seat lock the price?**
No. Only a completed payment does, and the date it's received is the date that
counts. That's why I'll always tell you which window is live rather than let you
assume.

**Do I need to bring a laptop?**
Yes — one you're comfortable working on, plus the charger. The weekend is hands
on the whole way through.

**Can I pay in installments?** · **What is the refund policy?** · **How many
seats are there?** · **Will it be recorded?** · **Can my employer be invoiced?**
Not settled. See below — do not answer these from improvisation.

---

## Not yet decided

Everything here is a real open item, not a formatting gap. Each one is a question
a requester can reasonably ask on day one, and the honest answer today is "I'll
confirm and come back to you" — which is fine once, and corrosive twice.

- **Payment method.** No method appears anywhere on the site, so template A
  cannot be sent as written until one exists. This is the blocking item.
- **Reply SLA.** The site promises nothing about response time. Pick one and hold
  it; 24 hours is the suggestion baked into the triage table above.
- **Cohort cap.** "Small cohort" is printed; a number is not. Template E cannot be
  sent without one, and neither can an honest scarcity claim.
- **Refund and transfer policy.** Nothing is stated. The first person to ask will
  ask before paying, not after.
- **Installments / employer invoicing.** Likely to come up given the price and the
  professional audience.
- **Recording.** The page implies in-person-only but never says whether anything
  is recorded or repeatable.
- **Where requesters are recorded.** The triage table says ClickUp; that list has
  to actually exist before the first request arrives.

---

## Before you send

- [ ] `node tests/tuition-window.mjs` — confirms the window and price to quote.
- [ ] Every `[PLACEHOLDER]` replaced.
- [ ] The price in the reply matches the window live **today**, not the one that
      was live when the requester wrote.
- [ ] The reply says, in some form, that requesting a seat does not reserve a
      seat or lock a price.
