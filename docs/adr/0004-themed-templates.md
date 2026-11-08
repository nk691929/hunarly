# ADR 0004: Themed templates

Status: accepted

Decision: Templates share one renderer (`ThemedTemplate`) and differ by a theme object plus default
style. A template that needs a different structure can supply its own component.

Why: One renderer means the preview, thumbnails and PDF always agree, and every template inherits
ATS-safe structure and fixes. Adding a template is mostly configuration.

Consequences: Templates differ in header, heading, skill and link styling and sizes, not in column
layout. Multi-column designs are intentionally excluded because they read poorly in applicant
tracking systems.

Visual regression: templates have DOM snapshot tests now. Pixel screenshots (Playwright) arrive
with the E2E suite in M11.
