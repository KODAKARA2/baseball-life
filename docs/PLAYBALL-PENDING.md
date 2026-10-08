# Playball start gate — pending original image

Base: c6b6afba59f2acfd70c3772b7dbb9433c1302a20 (PR30).
Worktree: /workspace/baseball-playball, branch feat/baseball-playball.

The requested original is Library libfile_ca424279f2348191897d5201b251f006, backing file_0000000061c881fd852d038a52ae14a3, filename image(20261007-103942).png (expected 950084 bytes, 1016×718). On 2026-10-08 the official resolved-reference materialization returned a transfer, but the freshly downloaded official transfer helper failed with `library file transfer failed: download failed` (exit 1). No original bytes were acquired or visually verified. No alternate image was generated, downloaded or substituted.

Prepared local code only: js/baseball-playball.js and css/baseball-playball.css. These are deliberately NOT loaded by index.html. The module delays creation of a game until after an 850ms static intro (350ms with reduced motion), key/pointer release and a 180ms input-settling interval. Escape/close, DOM removal, hidden tab or a new gate cancel it without callbacks. The returned cancel function also cancels a subsequently started game. It does not alter game RNG, storage, sound, probabilities or rewards.

`node tools/playball-gate-check.js` passed on Chromium at 320/390/1280: automatic start, held key, touch repeat, close/Escape/cancel/removal/hidden/reduced and all six real minigames created only after the gate, canceled without result callbacks. This is lifecycle testing, NOT original-image visual verification or end-to-end production integration. Timing assertions use a paused browser clock.

To finish: obtain the original through a working official Library transfer or a fresh user attachment in this environment; visually inspect its actual pixels and verify size/dimensions; copy unchanged to images/minigames/playball-original.png; connect the six U.mini* entrypoints after minigames.js and before panels.js so both practice and card games use the gate; rerun all regression/result/SFX tests with the intro explicitly handled, inspect original-image contain rendering at all three widths, then create draft PR, ready, merge and verify the existing Pages deployment. No push/PR/merge/deployment was done for this incomplete task.
