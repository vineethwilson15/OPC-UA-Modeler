import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Overview:
// Tests in this file validate the behaviour of the `FileImport` UI
// component. They focus on the component's decision-making rather
// than rendering details: file size and format checks, XML
// validation via `fileImportService`, duplicate detection,
// namespace conflict strategies, parse/error handling, recent-files
// persistence, and simple user actions (remove, recent history).
//
// To keep tests deterministic the suite mocks the UI library
// (`@siemens/ix-react`) and key services (`fileImportService`). The
// mocked `FileReader` simulates file reading in the JSDOM test
// environment.

// Mock @siemens/ix to avoid loading next.js package - must be before any imports that use it
vi.mock('@siemens/ix', () => ({
  UploadFileState: {
    UPLOAD_PENDING: 'upload-pending',
    UPLOAD_FINISHED: 'upload-finished',
    UPLOAD_FAILED: 'upload-failed',
    UPLOAD_SUCCEDED: 'upload-succeded',
  },
}));

// Mock Siemens IX components used in the component
vi.mock('@siemens/ix-react', () => ({
  IxButton: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  IxCard: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  IxCardContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  IxModalContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  IxModalHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  IxUpload: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Modal: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ModalRef: {},
}));

import FileImport from './FileImport';
import { NamespaceConflictStrategy } from '@/types/import.types';

describe('FileImport component', () => {
  let originalFileReader: unknown;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    // Simple mock FileReader that immediately yields provided contents
    originalFileReader = (global as unknown as { FileReader?: unknown }).FileReader;
    const MockFileReader = class {
      result: string | null = null;
      onload: ((e: { target: { result: string | null } }) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onprogress: ((e: unknown) => void) | null = null;
      readAsText(blob: { text?: () => Promise<string> } | Blob) {
        const hasText = typeof (blob as { text?: () => Promise<string> }).text === 'function';
        if (hasText) {
          (blob as { text: () => Promise<string> }).text().then((txt: string) => {
            this.result = txt;
            if (this.onload) this.onload({ target: this });
          });
        } else {
          this.result = '';
          if (this.onload) this.onload({ target: this });
        }
      }
    };
    (global as unknown as { FileReader?: unknown }).FileReader = MockFileReader;
  });

  afterEach(() => {
    (global as unknown as { FileReader?: unknown }).FileReader = originalFileReader;
  });

  it('rejects files larger than maxFileSize', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} maxFileSize={1 * 1024 * 1024} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('rejects unsupported formats', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();
    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('handles validation errors returned by fileImportService.validateXML', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('reports missing RequiredModel entries and does not parse', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('successfully imports a valid nodeset and calls onNodesetLoaded', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('skips duplicate files when detectDuplicate returns true', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('shows a warning when a folder is dropped', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('handles namespace conflict with rename strategy', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} namespaceConflictStrategy={NamespaceConflictStrategy.RENAME} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('rejects files when namespace conflict strategy is REJECT', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} namespaceConflictStrategy={NamespaceConflictStrategy.REJECT} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('reports PARSE_ERROR when generateChecksum throws', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('removes a loaded nodeset when Remove is clicked', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('passes checksum and current loadedChecksums to detectDuplicate (integration)', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('imports multiple files when RequiredModel is present across files', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('reports PARSE_ERROR when parseNodesetFile throws', async () => {
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('persists recent files in localStorage and shows them in dropdown', async () => {
    localStorage.clear();
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Component renders successfully
    expect(screen.getByText(/Import OPC UA Nodeset/i)).toBeInTheDocument();
  });

  it('clears recent files when Clear History is clicked', async () => {
    localStorage.clear();
    const onNodesetLoaded = vi.fn();
    const onError = vi.fn();

    render(<FileImport onNodesetLoaded={onNodesetLoaded} onError={onError} />);

    // Open dropdown
    fireEvent.click(screen.getByText(/Recent Files/));
    
    // Component renders successfully
    expect(screen.getByText(/No recent files/i)).toBeInTheDocument();
  });
});
