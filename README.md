# SDT Navigator

React demo showing how to list and scroll to content controls (SDTs) in a SuperDoc document.

## Key APIs

```typescript
import { createSuperDocUI } from 'superdoc/ui';

const ui = createSuperDocUI({ superdoc });

// List all SDTs
const { items } = editor.doc.contentControls.list({});

// Scroll only
await ui.contentControls.scrollIntoView({ id: nodeId, block: 'center' });

// Scroll + place caret
await ui.contentControls.focus({ id: nodeId, block: 'center' });
```

## Run

```bash
pnpm install
pnpm dev
```

## Docs

https://docs.superdoc.dev/editor/custom-ui/content-controls
