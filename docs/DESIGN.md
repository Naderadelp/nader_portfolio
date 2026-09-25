# Design notes

Why this site looks the way it does. `SPEC.md` covers what it contains and `DEPLOY.md` covers
shipping it; this file is only about the visual and editorial decisions, and the reasoning behind
the ones that were close calls.

## The problem with the first version

The first build was a two-column editorial document: name in a sticky sidebar, prose in a main
column, one violet accent. It was tasteful and it read as a CV rendered in HTML. The first screen
contained a name and a job title, which is the one moment a scanning reader is guaranteed to give
the page, spent on information already in the tab title.

It also had no answer to the comparison it was actually going to be subjected to. Other backend
and full-stack engineers in Cairo have portfolios. Several are very good. A quiet document does
not survive being opened in a tab next to them.

## The competitive read

Three reference points, deliberately different from each other:

- **A frontend engineer's showreel** — dark, soft purple/teal glow, a 3D physics canvas of
  tumbling technology logos, heavy scroll choreography. It works because the medium *is* the
  proof: the person selling frontend craft demonstrates frontend craft in the act of selling it.
- **A direct competitor** — same city, same stack, more experience. Claim-as-headline, portrait
  in a technical frame, scale stated in the subheading, a monospace trust row, stat cards that
  count up.
- **Infrastructure companies** (Inngest, Temporal, TigerBeetle) — near-black, huge left-aligned
  condensed display type, outline lettering, monospace microcopy, square edges, one hot accent.

The showreel was the wrong model to copy. Bolting a tumbling-logo canvas onto a backend portfolio
makes the motion decoration rather than evidence, and it picks a fight on the one axis where a
backend engineer cannot win. The infrastructure register was the right one: it is the visual
language of the subject matter.

## The organising idea

The site is built around one sentence that was already in the profile copy:

> Integrations, queues, and state that stays correct after the request ends.

Cut in two and set as a claim, that becomes the headline — **"The request ends. The work
doesn't."** — and it is the thesis the whole page argues. It is also a claim only this kind of
engineer can make, which is the point: it cannot be copied by someone who did not do the work.

The set-piece (`PipelineFigure`) is that sentence demonstrated. A request completes in 41ms and
the page keeps going: the job queues, the readiness check reports all 22 blockers at once, the
portal answers `429`, the client honours `retry_after`, the retry succeeds under `lockForUpdate`,
and an hour later the reconcile sweep finds a listing the portal silently expired. Every step is
true of the real subsystem.

## Decisions worth recording

**Amber, not blue.** Every neighbouring engineer portfolio is blue or violet. Amber is the colour
of the lighting in the portrait, so the photograph sits *in* the page rather than on it; it is
what a terminal uses for "in flight", which is the subject matter; and it creates immediate
separation from the sites this one will be compared against.

**Dark is the default, not a mirror of the OS.** The theme previously followed
`prefers-color-scheme`, which meant most visitors — light-mode laptops — were served the
alternate presentation of a site whose entire visual argument is amber on near-black. Light is
still fully supported and fully tested; it is now opt-in via the toggle.

**Real DOM instead of SVG for the set-piece.** Text in SVG does not reflow, does not scale with
the reader's font size, and cannot be selected. This project had already shipped one set of
diagrams whose labels rendered at roughly five pixels because a wide `viewBox` landed in a narrow
column. An `<ol>` of steps has none of those failure modes and reads correctly in a screen
reader.

**The pulse never touches anything behind a letterform.** The first version of the pipeline
animation moved `background-color` under live text. Contrast then becomes a function of *time*:
the axe run failed or passed depending on which frame it sampled. It now animates an inset left
bar beside the text instead, so every ratio on the figure is constant for the whole cycle. The
accessibility suite deliberately runs with animation enabled, and an intermittent contrast
failure there should be read as "something is animating under text", not as flakiness to re-run.

**Colourblind-safe status colours.** The pipeline first used green for success and red for a
`429` — precisely the pair a deuteranope cannot separate. Hues now come from the Okabe–Ito set
(bluish green / sky blue / vermillion), lightened to clear 4.5:1 on the background. Nothing is
encoded by colour alone in any case; every step is labelled in words.

**Authorship carries its method and its date.** "20,665 lines, sole author" is a claim. "Measured
with `git blame` on 24 September 2026, surviving lines per author, teammates' work attributed to
them" is a falsifiable claim, and almost nobody does it. This is the single strongest available
differentiator against more experienced competitors, because it is a statement about rigour
rather than about volume.

**The social card is treated as a first-class surface.** This site's realistic job is to be a
link pasted into an email or a DM, not to be discovered. A link with no card renders as a grey
rectangle. `scripts/make-og.mjs` renders the card in a real browser using the site's own
typography, and `metadataBase` is read from the environment — see `DEPLOY.md` for why that
default is dangerous.

## Things deliberately not done

- **No skill-percentage bars, no star ratings, no technology logo wall.** Unfalsifiable, and
  breadth reads as shallowness to a backend reviewer. The stack section groups honestly and keeps
  a separate "Own projects, not production" group so nothing implies production Node.
- **No fake terminal you have to type into.** It is template-saturated, it gates the reader
  behind a game, and it is unusable on a phone.
- **No typewriter or text-scramble headline.** None of the well-regarded engineer sites surveyed
  use one; it reads as a 2019 tell.
- **No 3D canvas.** ~150KB of JavaScript to say nothing about backend work, on a site whose
  credibility partly rests on being fast.
- **No invented metrics.** A monospace log strip was drafted for the pipeline section and cut,
  because making it convincing required numbers — rows scanned, drift repaired — that were not
  actually measured. The site's whole argument is that its numbers survive checking.

## Tests that exist because of this redesign

- `tests/contrast.test.ts` — parses the token declarations out of `globals.css` and recomputes
  every ratio, so a palette edit that breaks AA fails in milliseconds without a build.
- `tests/responsive.test.ts` — real Chrome at 320/360/390/430/768px, asserting no horizontal
  document scroll, no element past the right edge, and no text under 11px. It caught the portrait
  glow overflowing a 390px viewport by 4px on its first run.
