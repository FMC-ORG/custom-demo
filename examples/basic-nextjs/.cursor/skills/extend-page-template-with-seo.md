# Skill: Extend page templates with SEO fields  
  
## Use when  
- A page template needs project-specific SEO metadata  
- You want to extend Sitecore SXA SEO behavior safely  
  
## Rules  
- Never modify OOB `_Seo Metadata`  
- Create a project template that inherits from `_Seo Metadata`  
- Put the project extension under:  
  `/sitecore/templates/Project/<site-collection>/Presentation/`  
  
## Workflow  
1. Create a template such as `_Seo Metadata Extended`  
2. Set `__Base template` to include `_Seo Metadata`  
3. Add a `Data` section  
4. Add project-specific fields like:  
   - MetaTitle  
   - CanonicalUrl  
   - OpenGraphTitle  
   - OpenGraphDescription  
   - OpenGraphImage  
   - TwitterTitle  
   - TwitterDescription  
   - TwitterImage  
   - Robots  
5. Create `__Standard Values`  
6. Add the SEO extension as a base template to page templates that need it  
  
## Done checklist  
- [ ] OOB template not modified  
- [ ] Project SEO template created  
- [ ] Base template inheritance set  
- [ ] `__Standard Values` created  
- [ ] Page templates inherit the project SEO extension  