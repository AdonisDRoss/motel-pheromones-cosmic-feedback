# GLASSWELL TEST STEPS

## Boot test

Expected:
- title screen appears
- text says `DONNY IN THE CITY`
- tap/click/Enter starts
- Donny appears in C3

## Route test

Test in this order:

```text
1. C3 north → C2
2. C2 south → C3
3. C3 south → C4
4. C4 north → C3
5. C3 east → D3
6. D3 west → C3
```

## Placeholder test

These should show a message and not crash:

```text
C2 north → C1
C4 south → C5
C4 west  → B4
C4 east  → D4
D3 east  → E3
```

## Debug controls

```text
F / X = debug zones
C / Y = collision mask
ESC = title
```

## If the game black-screens

Check browser console for:
- missing file path
- bad JSON
- wrong capitalization
- GitHub Pages cache

Then bump the version string in `index.html` and `src/game.js`.
