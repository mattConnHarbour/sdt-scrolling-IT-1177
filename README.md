# SDT Navigator

List all content controls (SDTs) in a document and scroll to them.

## Features

- **List all SDTs**: Uses `editor.doc.contentControls.list()` to enumerate every content control in the document
- **Scroll to SDT**: Uses `ui.contentControls.scrollIntoView()` to scroll to a specific SDT
- **Focus SDT**: Uses `ui.contentControls.focus()` to scroll and place the caret inside an SDT
- **Search**: Filter SDTs by alias, tag, or content text
- **Metadata display**: Shows each SDT's alias, tag, type (block/inline), and lock mode
- **Two-way sync**: Clicking an SDT in the document highlights the corresponding card in the sidebar

## Key APIs demonstrated

```typescript
// List all content controls
const result = editor.doc.contentControls.list({});
const sdts = result.items;

// Scroll to an SDT (scroll only)
await ui.contentControls.scrollIntoView({ id: nodeId, block: 'center' });

// Focus an SDT (scroll + place caret)
await ui.contentControls.focus({ id: nodeId, block: 'center' });
```

## Running

```bash
pnpm install
pnpm dev
```

## Related

- [Contract templates demo](../contract-templates/) - Full SDT authoring workflow
- [Content controls docs](https://docs.superdoc.dev/document-api/features/content-controls)
