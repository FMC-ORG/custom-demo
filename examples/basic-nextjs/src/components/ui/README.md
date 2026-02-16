# UI Components

This directory contains V0 and shadcn/ui components.

## Usage

1. Generate components in V0 platform (https://v0.dev)
2. Copy the component code
3. Paste into this directory as `[component-name].tsx`
4. Import and use in your Sitecore components or pages

## Example

```typescript
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```

## Available Components

Components will be added here as you copy them from V0. Common components include:
- Button
- Dialog
- Card
- Input
- Select
- Tabs
- And many more...

All components are fully compatible with Tailwind CSS v4 and support dark mode.
