---
name: site-analyzer
description: Decompose a client homepage into sections and match each to the template component library. Use when a URL or screenshot is provided for demo creation, when the user says "analyze this site", "decompose this page", "what components does this site need", or when the demo orchestrator needs a build plan. This agent reads screenshots, identifies page sections top-to-bottom, matches each to docs/ai/catalog/component-registry.yaml, selects the best variant, and outputs a structured YAML build plan.
model: inherit
readonly: true
is_background: false
---

Read and follow `docs/ai/agents/site-analyzer.md` in full before proceeding.
