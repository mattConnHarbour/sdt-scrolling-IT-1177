/**
 * SDT Navigator: list and scroll to content controls (SDTs) in a document.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { SuperDoc } from 'superdoc';
// https://docs.superdoc.dev/editor/custom-ui/content-controls
import { createSuperDocUI } from 'superdoc/ui';

type NodeKind = 'block' | 'inline';
type LockMode = 'unlocked' | 'sdtLocked' | 'contentLocked' | 'sdtContentLocked';

type ContentControlInfo = {
  target: { kind: NodeKind; nodeType: 'sdt'; nodeId: string };
  controlType: string;
  lockMode: LockMode;
  properties?: { tag?: string; alias?: string };
  text?: string;
};

export function App() {
  const [sdts, setSdts] = useState<ContentControlInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Loading');
  const [ready, setReady] = useState(false);

  const superdocRef = useRef<SuperDoc | null>(null);
  const uiRef = useRef<ReturnType<typeof createSuperDocUI> | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const superdoc = new SuperDoc({
      selector: editorRef.current,
      documentMode: 'editing',
      document: '/nda-template.docx',
      modules: {
        comments: false,
        toolbar: { selector: '#superdoc-toolbar', responsiveToContainer: true },
      },
      telemetry: { enabled: false },
      onReady: ({ superdoc: sd }) => {
        const editor = (sd as any).activeEditor;
        if (!editor?.doc) {
          setStatus('Document API unavailable');
          return;
        }

        superdocRef.current = sd;
        uiRef.current = createSuperDocUI({ superdoc: sd });

        sd.on('content-control:click', ({ target }: { target: { nodeId?: string } }) => {
          setActiveId(target?.nodeId ?? null);
        });
        sd.on('content-control:active-change', ({ active }: { active: { nodeId?: string } | null }) => {
          if (!active) setActiveId(null);
        });

        const result = editor.doc.contentControls.list({});
        setSdts(result.items);
        setStatus('Ready');
        setReady(true);
      },
    });

    return () => {
      uiRef.current?.destroy();
      superdoc.destroy();
    };
  }, []);

  // Scroll only
  const scrollToSdt = useCallback((nodeId: string) => {
    if (!uiRef.current) return;
    setActiveId(nodeId);
    void uiRef.current.contentControls.scrollIntoView({ id: nodeId, block: 'center' });
  }, []);

  // Scroll + place caret
  const focusSdt = useCallback((nodeId: string) => {
    if (!uiRef.current) return;
    void uiRef.current.contentControls.focus({ id: nodeId, block: 'center' });
  }, []);

  const refreshList = useCallback(() => {
    const editor = (superdocRef.current as any)?.activeEditor;
    if (!editor?.doc) return;
    const result = editor.doc.contentControls.list({});
    setSdts(result.items);
    setStatus('List refreshed');
  }, []);

  const filteredSdts = sdts.filter((sdt) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const alias = (sdt.properties?.alias ?? '').toLowerCase();
    const tag = (sdt.properties?.tag ?? '').toLowerCase();
    const text = (sdt.text ?? '').toLowerCase();
    return alias.includes(q) || tag.includes(q) || text.includes(q);
  });

  const blocks = sdts.filter((s) => s.target.kind === 'block').length;
  const inlines = sdts.filter((s) => s.target.kind === 'inline').length;
  const summary = `${sdts.length} SDTs (${blocks} block, ${inlines} inline)`;

  return (
    <div className="app">
      <section className="editor-area">
        <header className="toolbar">
          <span className="title">SDT Navigator</span>
          <span className="summary">{summary}</span>
        </header>
        <div id="superdoc-toolbar"></div>
        <div ref={editorRef} id="editor"></div>
      </section>

      <aside className="sidebar">
        <header className="sidebar-header">
          <h2 className="sidebar-title">Content Controls</h2>
          <button
            className="btn refresh-btn"
            onClick={refreshList}
            disabled={!ready}
          >
            Refresh
          </button>
        </header>

        <input
          className="search"
          type="search"
          placeholder="Search SDTs..."
          aria-label="Search SDTs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <section className="sdt-list">
          {filteredSdts.length === 0 ? (
            <p className="empty">No content controls found</p>
          ) : (
            filteredSdts.map((sdt) => (
              <SdtCard
                key={sdt.target.nodeId}
                sdt={sdt}
                isActive={sdt.target.nodeId === activeId}
                onScroll={scrollToSdt}
                onFocus={focusSdt}
              />
            ))
          )}
        </section>

        <p className="status">{status}</p>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SDT Card Component
// ---------------------------------------------------------------------------

function SdtCard({
  sdt,
  isActive,
  onScroll,
  onFocus,
}: {
  sdt: ContentControlInfo;
  isActive: boolean;
  onScroll: (nodeId: string) => void;
  onFocus: (nodeId: string) => void;
}) {
  const alias = sdt.properties?.alias || '(no alias)';
  const tag = sdt.properties?.tag || '(no tag)';
  const preview = truncate(sdt.text ?? '', 50);
  const kind = sdt.target.kind;
  const lockMode = formatLockMode(sdt.lockMode);

  return (
    <article
      className={`sdt-card ${isActive ? 'is-active' : ''}`}
      onClick={() => onScroll(sdt.target.nodeId)}
    >
      <div className="sdt-card-header">
        <h3 className="sdt-alias">{alias}</h3>
        <span className={`sdt-kind ${kind}`}>{kind}</span>
      </div>
      <p className="sdt-preview">{preview}</p>
      <div className="sdt-meta">
        <span className="sdt-lock">{lockMode}</span>
        <span className="sdt-tag" title={tag}>
          {truncate(tag, 30)}
        </span>
      </div>
      <div className="sdt-actions">
        <button
          className="scroll-btn"
          onClick={(e) => {
            e.stopPropagation();
            onScroll(sdt.target.nodeId);
          }}
        >
          Scroll
        </button>
        <button
          className="focus-btn"
          onClick={(e) => {
            e.stopPropagation();
            onFocus(sdt.target.nodeId);
          }}
        >
          Scroll & Focus
        </button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLockMode(mode: LockMode): string {
  switch (mode) {
    case 'unlocked':
      return 'Unlocked';
    case 'sdtLocked':
      return 'SDT Locked';
    case 'contentLocked':
      return 'Content Locked';
    case 'sdtContentLocked':
      return 'Both Locked';
    default:
      return mode;
  }
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + '\u2026';
}
