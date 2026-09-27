# Chain Chime Web App Specification

## 1. Overview

Build a web app that runs multiple timers in sequence.

Each timer can have a different duration. When the first timer ends, the next timer starts automatically. This continues through the sequence.

A main use case is managing a 90-minute class in several parts:

- First 10 minutes
- Next 50 minutes
- Last 30 minutes

The app should show more than a countdown: it should show the current part of the full schedule and how far that part has progressed.

This spec mainly defines features, state, controls, and saving settings in the URL.

Details such as layout, colors, shapes, and animation will be considered separately.

---

## 2. Terms

### 2.1 Timer

A timer is one time interval in the sequence.

Each timer has these settings:

- Duration
- Divisions

A timer does not store its own elapsed time as a separate state.

### 2.2 Duration

Set the time assigned to a timer in minutes.

Only positive integers are allowed.

The current provisional range is:

```text
1–60 minutes
```

### 2.3 Division marks

Division marks split a timer's duration into equal parts.

A division value of `n` means the display divides the duration into `n` equal parts.

A value of `0` means no division marks.

The current provisional range is integers from:

```text
0–20
```

### 2.4 Timer sequence

A timer sequence is a list of timers in execution order.

There must always be at least one timer.

The current provisional maximum is 10 timers.

---

## 3. Basic execution model

### 3.1 Running timers in sequence

Run timers in order, starting with the first timer.

For example, given:

```text
10 minutes → 50 minutes → 30 minutes
```

1. Run the 10-minute timer.
2. After 10 minutes, automatically start the 50-minute timer.
3. After another 50 minutes, automatically start the 30-minute timer.
4. Stop the sequence when the 30-minute timer ends.

---

## 4. State model

### 4.1 Total elapsed time

Use one total elapsed time for the entire sequence as the main progress state.

Do not store separate elapsed times for individual timers.

Calculate each timer's elapsed time from:

- The current timer sequence
- The duration of each timer
- Total elapsed time

### 4.2 Distributing elapsed time across timers

Apply total elapsed time to the timers in order, starting at the beginning.

For example, with:

```text
10 minutes → 50 minutes → 30 minutes
```

and 35 minutes of total elapsed time:

```text
First:  10 / 10 minutes
Second: 25 / 50 minutes
Third:   0 / 30 minutes
```

Always apply this rule, including after settings changes or reordering.

### 4.3 Progress does not belong to a timer

Do not give individual timers a stored record of how far they have progressed.

When timers are reordered, do not preserve the previous progress of each timer.

For example, with 30 minutes of total elapsed time and:

```text
A: 10 minutes
B: 50 minutes
C: 30 minutes
```

the result is:

```text
A: 10 / 10 minutes
B: 20 / 50 minutes
C:  0 / 30 minutes
```

If the order changes to:

```text
C → B → A
```

redistribute the same 30 minutes in the new order:

```text
C: 30 / 30 minutes
B:  0 / 50 minutes
A:  0 / 10 minutes
```

---

## 5. Run states

The app has at least these states.

### 5.1 Paused

Time is not advancing.

Always start paused when the page opens.

The initial total elapsed time is 0.

### 5.2 Running

Total elapsed time increases as time passes.

Start changes the state from paused to running.

### 5.3 Completed

Total elapsed time has reached the sum of all timer durations.

When the last timer ends, stop automatically and enter the completed state.

Start is disabled in the completed state.

Reset the entire sequence before starting again.

---

## 6. Overall controls

### 6.1 Start / Pause

Use one control that switches between Start and Pause.

#### Paused

Start is available.

Start resumes from the current total elapsed time.

#### Running

Pause is available.

Pause stops time while keeping the current total elapsed time.

#### Completed

Start is not available.

### 6.2 Reset all

Reset all sets:

```text
Total elapsed time = 0
```

The calculated elapsed time of every timer also becomes 0.

Resetting a completed sequence returns it to paused, so it can start again.

---

## 7. Editing while paused

Edit timer settings while the sequence is paused.

Support at least these operations:

- Add a timer
- Delete a timer
- Reorder timers
- Change a duration
- Change divisions
- Reset an individual timer

Do not allow these changes while running.

---

## 8. Adding a timer

Allow a new timer to be added.

A new timer has these defaults:

```text
Duration: 3 minutes
Divisions: 0
```

Under the current provisional limit, a timer cannot be added when there are already 10 timers.

---

## 9. Deleting a timer

Allow timers to be deleted.

At least one timer must remain.

If there is only one timer, it cannot be deleted.

---

## 10. Reordering timers

Allow timers to be reordered while paused.

Reordering does not change total elapsed time.

Apply total elapsed time to the new sequence from the beginning.

---

## 11. Changing a duration

Allow each timer's duration to be changed while paused.

In general, preserve total elapsed time when settings change.

Apply total elapsed time to the updated sequence from the beginning.

### 11.1 Example

Before the change:

```text
10 minutes → 50 minutes → 30 minutes
```

Total elapsed time:

```text
35 minutes
```

The distribution is:

```text
10 / 10 minutes
25 / 50 minutes
 0 / 30 minutes
```

Change the second timer from 50 minutes to 10 minutes:

```text
10 minutes → 10 minutes → 30 minutes
```

Redistribute the 35 minutes of total elapsed time:

```text
10 / 10 minutes
10 / 10 minutes
15 / 30 minutes
```

---

## 12. Clamping total elapsed time

If a settings change makes the total duration shorter than the current total elapsed time, clamp elapsed time to the new total duration.

For example:

```text
Current total elapsed time: 70 minutes
New total duration: 60 minutes
```

Set:

```text
Total elapsed time = 60 minutes
```

Do not retain a record of the time beyond 60 minutes.

---

## 13. Resetting an individual timer

Allow individual timers to be reset while paused.

Resetting a timer rewinds total elapsed time to that timer's start.

Let `S` be the sum of the durations before timer `i`. Reset total elapsed time to `S`, but never increase it above its current value.

For example, with:

```text
10 minutes → 50 minutes → 30 minutes
```

and 65 minutes of total elapsed time:

```text
10 / 10 minutes
50 / 50 minutes
 5 / 30 minutes
```

Resetting the second, 50-minute timer sets:

```text
Total elapsed time = 10 minutes
```

The result is:

```text
10 / 10 minutes
 0 / 50 minutes
 0 / 30 minutes
```

Resetting a timer that has not started must not move time forward.

---

## 14. Internal state rules

Do not store past progress that cannot be derived from the current state shown on screen.

In particular, do not store:

- Each timer's progress before reordering
- Each timer's progress before a settings change
- Elapsed time discarded when the total duration was shortened

Determine the current state only from the current timer settings and total elapsed time.

---

# 15. Saving settings in the URL

## 15.1 Purpose

Represent the current timer settings as URL query parameters.

Users can bookmark the URL to reuse the same settings later.

Do not save progress in the URL.

Opening the URL must always start with:

```text
Total elapsed time = 0
State = Paused
```

---

## 15.2 The `timers` parameter

Use the `timers` query parameter for timer settings.

Separate timers with underscores `_`. Use a hyphen `-` between the duration and the division value.

Each timer normally uses this format:

```text
duration
```

or:

```text
duration-divisions
```

### Example

```text
?timers=10-5_50_30-3
```

means:

```text
10 minutes, divisions = 5
50 minutes, no division marks
30 minutes, divisions = 3
```

The order in the parameter is the execution order. Only the underscore/hyphen format is supported; the previous comma/colon format is not supported. Invalid entries use the fallback described in section 15.4.

---

## 15.3 Omitting zero divisions

A division value of `0` means no division marks.

These entries mean the same thing:

```text
10
10-0
```

When writing a normalized URL, omit zero divisions.

The normalized form is:

```text
10
```

---

## 15.4 Invalid entries

Split the `timers` value at underscores and parse each entry separately.

If an entry cannot be read as a valid timer setting, use:

```text
3 minutes, no division marks
```

### Example

```text
?timers=10-5_abc_30
```

loads as:

```text
10 minutes, divisions = 5
3 minutes, no division marks
30 minutes, no division marks
```

---

## 15.5 Empty entries

Treat an empty entry as invalid.

For example:

```text
?timers=10__30
```

loads as:

```text
10 minutes, no division marks
3 minutes, no division marks
30 minutes, no division marks
```

---

## 15.6 An empty `timers` value

Treat this URL as one empty entry:

```text
?timers=
```

The result is one timer with:

```text
3 minutes, no division marks
```

---

## 15.7 No `timers` parameter

If the `timers` parameter is missing, start with one timer with:

```text
3 minutes, no division marks
```

All of these cases therefore start with one 3-minute timer:

```text
No timers parameter

?timers=

?timers=abc
```

---

# 16. Updating the URL

## 16.1 When to update

Update the URL when the user explicitly changes timer settings.

This includes at least:

- Adding a timer
- Deleting a timer
- Reordering timers
- Changing a duration
- Changing divisions

There is no need to update the URL for Start, Pause, elapsed time, Reset all, or other actions that do not change timer settings.

Do not include elapsed time in the URL.

---

## 16.2 URL normalization

When an explicit settings change updates the URL, write the current settings in normalized form.

For example, if the loaded URL is:

```text
?timers=10-0_20-5
```

do not rewrite it just because it was loaded.

When a later settings change updates the URL, normalize it like this:

```text
?timers=10_20-5
```

---

## 16.3 Loading an invalid URL

Do not rewrite the URL on load, even if it contains invalid entries.

For example, opening:

```text
?timers=10_abc_30
```

uses these settings internally:

```text
10 minutes
3 minutes
30 minutes
```

Keep the address bar unchanged.

Only after the user explicitly changes settings should the app generate a normalized URL from the current settings.

---

# 17. Setting limits

The current provisional values are:

| Setting | Minimum | Maximum | Default |
|---|---:|---:|---:|
| Timer duration | 1 minute | 60 minutes | 3 minutes |
| Divisions | 0 | 20 | 0 |
| Timer count | 1 | 10 | 1 |

Duration and divisions must be integers.

Define these limits together as constants instead of scattering values throughout the code.

Conceptually, use constants such as:

```js
const MIN_TIMER_MINUTES = 1;
const MAX_TIMER_MINUTES = 60;

const MIN_DIVISION_LINES = 0;
const MAX_DIVISION_LINES = 20;

const MIN_TIMER_COUNT = 1;
const MAX_TIMER_COUNT = 10;

const DEFAULT_TIMER_MINUTES = 3;
const DEFAULT_DIVISION_LINES = 0;
```

The design should allow future limit changes by updating these constants.

The current maximum total duration is:

```text
60 minutes × 10 timers = 600 minutes
```

This is 10 hours.

---

# 18. Basic state formulas

Let the duration of timer `i` be:

```text
d[i]
```

Let total elapsed time be:

```text
T
```

The start time of timer `i` is:

```text
start[i] = d[0] + d[1] + ... + d[i-1]
```

Calculate its elapsed time as:

```text
elapsed[i] = clamp(T - start[i], 0, d[i])
```

Here, `clamp(x, min, max)` returns:

```text
min if x < min
max if x > max
x otherwise
```

There is no need to store each timer's elapsed time as persistent state.

---

# 19. Rules for state changes

When timer settings change, update state in this order:

1. Update the timer sequence settings.
2. Calculate the new total duration.
3. If total elapsed time exceeds the new total duration, clamp it to that duration.
4. Recalculate each timer's elapsed time from the new sequence and total elapsed time.
5. Normalize and update the URL.

Do not reference old timer positions or old individual elapsed times.

---

# 20. Initial state

Use these states on a normal page load.

### When the URL has valid settings

Create the sequence from those settings.

```text
Total elapsed time = 0
State = Paused
```

### When the URL has no `timers` parameter

Create one timer with:

```text
3 minutes, no division marks
```

Start with:

```text
Total elapsed time = 0
State = Paused
```

---

# 21. Completion behavior

Stop advancing time when total elapsed time reaches the sum of all timer durations.

Enter the completed state at that point.

In the completed state:

- Timers are stopped.
- Start is disabled.
- Reset all is available.

After Reset all:

```text
Total elapsed time = 0
State = Paused
```

The sequence can then start again.

---

# 22. Implementation principles

Use the following principles.

### 22.1 Separate settings from progress

Settings state:

- Timer sequence
- Each timer's duration
- Each timer's divisions

Progress state:

- Total elapsed time
- Run state

Save only settings in the URL.

### 22.2 Do not store elapsed time for individual timers

Always calculate each timer's elapsed time from total elapsed time.

This applies the same rules after:

- Duration changes
- Reordering
- Adding or deleting timers

### 22.3 Do not keep hidden past state

Do not retain past state that can affect later behavior beyond the current settings and progress shown on screen.

---

# 23. Open questions at the time of this spec

The following points have not been explicitly settled in the discussions covered by this spec. Decide them before or during implementation.

## 23.1 More than 10 timers in the URL

The app's maximum timer count is 10, but if:

```text
?timers=...
```

contains 11 or more entries, the choice between these options is still open:

- Use only the first 10 entries.
- Treat the entire URL as invalid.
- Use another approach.

## 23.2 Out-of-range numbers in the URL

For example:

```text
?timers=61
?timers=10-21
```

These values are numeric but exceed the current limits. Their handling has not been explicitly settled.

One option is to treat the entry as invalid and fall back to 3 minutes with no division marks. This is not yet a confirmed part of this spec.

## 23.3 Other query parameters

It is not yet settled whether to preserve query parameters other than `timers` when updating settings.

## 23.4 Display and UI

This spec does not yet define:

- How each timer is displayed
- How the current timer is highlighted
- How overall progress is displayed
- How division marks are drawn
- Formats for clock time, time left, and elapsed time
- Controls for adding, deleting, and reordering timers
- Placement and appearance of Start, Pause, and Reset buttons
- Completion notifications
- Whether to play sounds
- Notifications when timers change
- Responsive layout
- Keyboard controls
- Accessibility details

Define these separately when planning the display.
