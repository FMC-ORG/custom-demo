# AI reference sources  
  
This folder contains internal/project-specific AI references.  
  
## Expected contents  
- `sitecore-marketer-mcp-reference.md`:  
  project-specific notes for using the Sitecore marketer MCP,  
  common Sitecore item paths,  
  local conventions,  
  and known working patterns.  
  
## External tools used by agents  
- `sitecore_docs` MCP:  
  use when official Sitecore product behavior needs verification.  
- `sitecore marketer` MCP:  
  use to create/update Sitecore items whenever possible.  
  
## Priority  
1. Always-on rules in `AGENTS.md` (imported by `CLAUDE.md`, generated into `.cursor/rules/`)  
2. Skills under `.agents/skills/` (shared standards in `sitecore-standards`)  
3. Internal project references in this folder  
4. Official docs via `sitecore_docs` MCP  
5. Worked examples in each create skill's `references/examples/`  
  
Project-specific conventions override generic examples.  
Official Sitecore mechanics should be checked with the docs MCP when uncertain.  