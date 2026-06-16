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

Docs: https://docs.superdoc.dev/editor/custom-ui/content-controls

## Run

```bash
pnpm install
pnpm dev
```

## Structure

- `src/App.tsx` - Main React component with SuperDoc integration
- `src/style.css` - Styling
- `public/nda-template.docx` - Sample document with SDTs
