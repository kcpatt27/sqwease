# SQWease Specifications

Planning documents that authorize the work in `tickets/`. Each spec names its branch and
the tickets it consumes or fixes.

| Spec | Branch | Purpose |
|------|--------|---------|
| [SPEC-ui-intl-a11y-perf.md](./SPEC-ui-intl-a11y-perf.md) | `ui/intl-a11y-perf` | Language-agnostic shell, WCAG 2.2 AA primary flow, multi-device layout, performance pass |
| [SPEC-language-scaffolding.md](./SPEC-language-scaffolding.md) | (shared by all `lang/*`) | Config/UI plumbing and the dataset-acquisition + prompt workflow |
| [SPEC-lang-spanish.md](./SPEC-lang-spanish.md) | `lang/spanish` | Spanish starter deck |
| [SPEC-lang-french.md](./SPEC-lang-french.md) | `lang/french` | French starter deck |
| [SPEC-lang-korean.md](./SPEC-lang-korean.md) | `lang/korean` | Korean starter deck |
| [SPEC-lang-mandarin.md](./SPEC-lang-mandarin.md) | `lang/mandarin` | Mandarin starter deck |

Order of work: implement the UI shell first; the four language branches are cut from it and
only add files.
