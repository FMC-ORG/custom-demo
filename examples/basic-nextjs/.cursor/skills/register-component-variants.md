# Skill: Register Sitecore component variants  
  
## Use when  
- One datasource supports multiple visual layouts  
- Example: Default and Compact versions of the same component  
  
## Workflow  
1. Put all variants in the same TSX file  
2. Export `Default` first  
3. Add additional named exports like `Compact`, `WithImage`, `FullWidth`  
4. Register the component once in `.sitecore/component-map.ts`  
5. Create the component's Variants container under:  
   `/sitecore/content/<site-collection>/<site-name>/Presentation/Headless Variants/`  
6. Create Variant Definition items inside the container  
7. Ensure Variant Definition item names exactly match code export names  
  
## Done checklist  
- [ ] `Default` export exists  
- [ ] Variant exports exist  
- [ ] Component registered once in component map  
- [ ] Headless Variant items exist  
- [ ] Item names match export names exactly  