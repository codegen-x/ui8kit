# Magazine study: designers and art directors

Status: **ready to run; no participants invited, no observations yet**.
The first group is designers and art directors, as chosen by the project owner.

## Goal

Check whether magazine helps to choose and explain an art direction, to tell
structure apart from styling, to explore variants and to obtain the right preset.
Free access and no sign-in are part of the task context.

## Sample and conditions

First qualitative round: 5–6 participants, for example 3 practising designers
and 2–3 art directors. This is a proposal for finding problems, not a statistically
representative assessment of the industry. Record UI experience, experience with design
systems and prior familiarity with UI8Kit. The product founder does not replace a participant.

Session of 30–40 minutes. Isolated browser profile, same revision,
1440 × 1080, light, one entry fixture. Record the participant's screen, their usual browser
and input method. Do not use the research renderer
to assess the whole user journey: it serves visual comparison.
Use magazine for REF-B1; for REF-B3 a separate viewer
with real normalized previews is acceptable. Always note where the task took place.

The entry fixture `fixtures.entry.route` replaces the saved picks. Explain
that the set is predefined and does not yet express the participant's individual taste.
The researcher agrees on recording; written notes only are allowed.
Pseudonyms P01…P06, no email or name in the result set.

## Moderator instructions

"In front of you is a free library of directions built on UI8Kit. We are testing how
understandable it is. You may think aloud, go back or reject a
variant. Tell us when you consider the task finished."

Do not show the expected path, and do not explain the difference between tokens and
compositions in advance. A hint is allowed after an explicit request or 3 minutes without progress;
record it verbatim and mark the task assisted. The participant may stop early.
Same task and completion criterion for all participants in a round.

## REF-B1 — Choosing a direction

**Task:** "You need the home page of a small design studio. It must
clearly show the studio's approach and offer one clear next step.
Choose the direction you would start from. Show one more
variant you considered and explain why you preferred the first."

**Observe:** which traits the participant uses, where they look for alternatives,
whether they separate the desired mood from structure and task. There is no single correct
conceptId. The moderator records the explanation and does not declare the taste successful.

**Completion:** the chosen variant and an alternative are named; the explanation contains
at least a link to the task and an observable trait. Rate the explanation after
the session with two reviewers; keep disagreement, do not hide it in an average score.

## REF-B2 — Changing typography

Starting state: authored ref-c02 on the Design system page.

**Task:** "Show this page with Inter in headings and body text.
Keep its colour palette and element radius. Explain what changed."

**Completion:** screen, skin and radius match the base; both fonts are inter.
Expected variant `ref-c02:font`. Record state success and
understanding separately: line breaks and visual text density may change.

## REF-B3 — Compositions of one family

Show normalized ref-c10 and ref-c11. Alternate the left/right position across
participants and record the order. Shared copy and tokens remove part of the confounding factors;
the media itself remains part of the concept.

**Task:** "Both screens belong to the same group. What difference do you see in
their structure? For what kind of message would you choose each?"

**Completion:** the participant names a concrete difference in the dominant element and reading
order. Relation `ref-r12`; do not show its explanation before the answer. Keep any
detailed fitness rationale verbatim; do not substitute it with
matching legacy composition tags.

## REF-B4 — Carrying over to a template

Starting state: authored ref-c07.

**Task:** "See how the chosen styling works on the Blog template.
What would you carry over into a project, and what would have to be solved again?"

**Completion:** blog is open; what the participant considers
preserved and changed is recorded separately. Late question after the answer: "Was the
source screen's composition preserved here?" Do not ask it in advance. Opening the template
confirms the transition; understanding of the carry-over is assessed separately.

## REF-B5 — Saving and preset

Starting state: ref-c05:radius (`radius=8`).

**Task:** "Save this variant to a collection and get a preset to
hand over to a developer. Show how you made sure you got the right variant."

**Completion:** the collection item and the successfully copied JSON match the
expected style key. A browser clipboard denial is a separate environment error.
Do not count integration into a project as done: this checks obtaining the preset.

## Measurement protocol

For each task record: participantId, taskId, revision, surface, viewport,
startAt, endAt, activeDurationMs, outcome, helpCount, backtrackCount,
wrongTurnCount, chosenConceptId/variantId, answer, observation and confidence 1–5.

- Timing starts after the task is read and readiness is confirmed.
- It stops at observed completion, abandonment or the end of the time limit.
- A hidden tab and moderator pauses are excluded from activeDurationMs.
- Outcomes: success, assisted, failed, abandoned, incomplete. A missing
  record does not mean failed. Do not mix assisted with independent success.
- Backtrack — returning to an already viewed state after leaving it.
  It may be a useful comparison; the reason matters more than the count.
- Wrong turn — an action after which the participant reports a mismatch with
  the task or has to correct the state. Do not infer it from a click automatically.
- For the first round report raw counts and separate times per task;
  do not present 5–6 observations as a statistically significant design ranking.
- Ask for confidence after the task and store it next to the explanation.

## What to decide after the round

1. Separate problems of navigation, language, comparison, visual hierarchy and state.
2. For each finding name the participants, observation, context and limitation.
3. Choose 2–3 changes with the greatest impact on choosing/obtaining a variant.
4. Repeat the same tasks on the next revision, keeping the criteria.
5. After human observations decide which events the UX harness can
   reliably record automatically. Explanation and fitness remain
   human data.

Recording form: [research-session.template.json](research-session.template.json).
Fill in a copy, not the template. Screenshots and geometric flags on their own
are not user research results.
