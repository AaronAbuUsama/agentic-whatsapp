---
status: accepted
---

# The Director wakes on a heartbeat and on its own intent, and both are required

Three ways to make anything happen when nobody has messaged, and only one of them
survives contact with a Mission that runs for weeks.

**Bottom-up alone is dead on arrival.** If the Director wakes only when a Delegate
reports, then forty outreach Briefs sent on Monday and answered by nobody leave a
system that never runs again. Every unanswered message becomes a permanent stall,
which is fatal for work whose whole job is chasing people who do not reply.

**A fixed tick alone is wasteful and blunt.** Waking every five minutes to
conclude that nothing has changed spends the Director's context budget on empty
runs, and it cannot express "there is nothing to do until Thursday."

**Self-scheduling alone is a single point of permanent failure.** A Director that
ends each run by naming its next wake is exactly what long-horizon planning
needs — until one run crashes before naming it, or writes a time that never
arrives, or the state holding it is lost. There is then no event in the system
capable of starting it again. It is not stopped; it is unreachable.

So both. The Director ends each run by naming when it next intends to wake, and a
**heartbeat runs regardless** on a slow, fixed cadence. The heartbeat is not a
polling loop dressed up — its job is to find a Director that should have woken and
did not, and start it.

## Consequences

- The heartbeat's cadence is a liveness bound, not a latency one. It sets how long
  a lost wake can go unnoticed, so it is measured in tens of minutes rather than
  seconds, and it is cheap because it almost always finds nothing to do.
- A wake that fires and finds nothing due is a normal, silent outcome. Only a wake
  that finds an _overdue_ intent is interesting, and it is worth recording, since
  it means something failed.
- Mission Control shows the next intended wake, not the heartbeat. The heartbeat
  is machinery; the intent is the thing a person wants to know.
- A Delegate's own follow-up timers do not wake the Director. "Nudge once after
  three days, then report dead" is a decision inside a Brief, and routing it
  upward would rebuild the bottleneck the Director exists to avoid.
