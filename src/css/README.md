# The stylesheet, in order

`assets/styles.css` is **generated** from these files. Edit them, not it.
`tools/build-locales.js` concatenates every `*.css` here in filename order,
writes the readable whole to `assets/styles.css`, and emits the hashed copy
the pages actually load.

## The numbers are the cascade

They are not decoration. CSS resolves ties by document order, so the number
in the filename *is* the priority, and concatenating in a different order is
a different stylesheet. Two rules can be equally specific and the later one
wins -- `26-responsive.css` relies on this constantly, and a bug earlier in
this project came from two `@media(max-width:480px)` rules for the same
selector sitting 20 lines apart in one block.

So: **do not renumber to tidy up.** To add a section, give it a number that
places it where it has to be. If you need a gap, renumber deliberately and
rebuild -- `npm run build` will tell you if anything moved, because the
concatenation is checked against what the pages expect.

## Where things live

| Range | What |
|---|---|
| `00`-`05` | preamble, reset, tokens, and the chrome that loads first |
| `06`-`09` | nav, hero, zoom strip, marquee |
| `10`-`12` | shared section furniture, the reveal system, buttons |
| `13`-`22` | one file per page section, in the order they appear |
| `23`-`25` | word reveal, language switcher, mobile nav |
| `26` | **responsive** -- every breakpoint, and it must stay after the components |
| `27`-`33` | things added later that must override what came before |

`26-responsive.css` is the one to read first when a layout breaks at a
narrow width, and the one to be most careful editing: it is where component
rules get overridden, so its position after all of them is load-bearing.
