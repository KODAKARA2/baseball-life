# Baseball action result cutins

Base: latest main `e55c66b` (includes PR28 acquaintance proposals). Independent worktree/branch; no Footballlife files or assets copied. Five original baseball images created with the built-in image generator on 2026-10-08, saved directly in this environment, then inspected. Paths, prompts, hashes and dimensions are recorded in `assets/baseball-result-art/progress.json`. The previously unavailable umpire playball image is unrelated and is not implemented here.

- Clean batting contact: existing home-run or hit result only. Existing text still distinguishes home run and hit.
- Catcher's mitt reception: accurate strike/strikeout only.
- First-base reception: accurate/stable throw only.
- Safe steal: successful/perfect start only.
- Pitcher/catcher communication: all three signs correct only; partial matches retain the old result.
- Timer: batting or pitching artwork according to the player's role, only within the original good timing band (error ≤0.2 s and no timeout).

The new baseball-specific presentation module preloads one image per drill and shows it for 320 ms inside the original 1600 ms result delay (timer 1200 ms). `mgEnd` remains the one-shot judgment point for five games; timer uses its original guarded finish. No RNG, probability, reward, storage or sound code is added by artwork. The existing synthetic contact/result sounds remain authoritative. Failed/unloaded artwork and reduced motion skip the panel, and hidden tab, resize, cancel or removed DOM clean up it and its observers/listeners. Separate text and contain preserve the whole image.

Run `node tools/run-checks.js` for the existing engine, simulation, growth, UI, feedback and new artwork suite. Existing Edge/file-URL browser tests run through a small Chromium/localhost compatibility preload; their assertions are unchanged. Dependencies: existing Playwright plus Chromium. The repository is a buildless static site; entrypoint paths, CNAME and .nojekyll are checked separately. No build system or new hosting service is introduced.

## Validation (2026-10-08)

All 19 regression jobs passed, including 200 career simulations, 1000 growth-balance samples, the PR28 acquaintance-proposal checks, synthetic-audio unit/browser checks and the new result-art browser check. The first artwork test run exposed an automation-only issue: Playwright waited for the continuously animated timer button to become stable before tapping. The test now sends a real touchscreen coordinate tap and passed both standalone and through the compatibility preload; all other jobs passed on their first full-suite run.

Artwork tests cover 320/390/1280 widths, actual keyboard/touch input for six drills, both timer roles, success/failure/partial-result mapping, missing image fallback, duplicate result calls, cancel/removal, hidden tab, resize, reduced motion, original callback delays and unchanged storage. Screenshots were inspected for batting, pitching, throwing, stealing, signs and timing. Static entrypoint checks verified local scripts/styles, unchanged CNAME and .nojekyll. Audio tests verify calls and synthesized levels; no human listening is claimed.
