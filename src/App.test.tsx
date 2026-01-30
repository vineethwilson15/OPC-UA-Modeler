import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { showModal } from '@siemens/ix-react';

// Tests for the top-level `App` component.
// Purpose: verify the header renders, the upload control is present,
// and the import dialog opens when the upload button is clicked.

// Mock @siemens/ix types and configurations
vi.mock('@siemens/ix', () => ({
  AppSwitchConfiguration: {},
}));

// Mock Siemens IX components used by `App` to avoid pulling in the full UI
// library during tests. Each mock returns a simple DOM element that
// preserves the important contract used by `App` (props and children).
vi.mock('@siemens/ix-react', () => ({
  // Application shell wrapper
  IxApplication: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  // Header component: exposes `name` prop and child header controls
  IxApplicationHeader: (props: { name?: React.ReactNode; nameSuffix?: string; children?: React.ReactNode }) => (
    <header>{props.name}{props.children}</header>
  ),
  // Icon button: forward onClick and render children so tests can click it
  IxIconButton: (props: { onClick?: () => void; children?: React.ReactNode }) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  // Regular button: forward onClick and render children so tests can click it
  IxButton: (props: { onClick?: () => void; children?: React.ReactNode }) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  // Menu components
  IxMenu: (props: React.PropsWithChildren<unknown>) => <nav>{props.children}</nav>,
  IxMenuSettings: () => <div data-testid="menu-settings" />,
  IxMenuAbout: () => <div data-testid="menu-about" />,
  // Content components
  IxContent: (props: React.PropsWithChildren<unknown>) => <main>{props.children}</main>,
  // Layout components
  IxLayoutGrid: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  IxRow: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  IxCol: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  IxPane: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  IxPaneLayout: (props: React.PropsWithChildren<unknown>) => <div>{props.children}</div>,
  // Empty state component
  IxEmptyState: (props: { header?: string; subHeader?: string; action?: string; onActionClick?: () => void }) => (
    <div>
      <h2>{props.header}</h2>
      <p>{props.subHeader}</p>
      {props.action && <button onClick={props.onActionClick}>{props.action}</button>}
    </div>
  ),
  // Modal utilities
  showModal: vi.fn(),
}));

// Mock icon module used by the header. We don't need the actual icon
// implementation; a placeholder value is sufficient for tests.
vi.mock('@siemens/ix-icons/icons', () => ({
  iconCloudUpload: 'iconCloudUpload',
  iconClear: 'iconClear',
  iconPrint: 'iconPrint',
  iconMoon: 'iconMoon',
  iconSun: 'iconSun',
  iconTable: 'iconTable',
  iconTree: 'iconTree',
}));

// Mock child components used by `App`.
// - `FileImport` is mocked with a forwarded ref signature so the
//   component shape matches the real implementation. It exposes a
//   `data-testid="file-import"` element and reflects the
//   `isDialogOpen` prop via a `data-open` attribute so tests can
//   assert dialog open/close state without rendering the full dialog.
vi.mock('./components/FileImport/FileImport', () => {
  return {
    __esModule: true,
    default: React.forwardRef<HTMLDivElement, { isDialogOpen?: boolean }>((props, ref) => {
      void ref;
      return <div data-testid="file-import" data-open={props.isDialogOpen ? 'true' : 'false'} />;
    }),
  };
});

// Stub `NodeTree` — `App` only needs to render it conditionally, so a
// simple placeholder is sufficient for these high-level tests.
vi.mock('./components/NodeTree/NodeTree', () => ({
  __esModule: true,
  default: () => <div data-testid="node-tree" />,
}));

// Stub `DetailPanel` similarly — a lightweight placeholder keeps tests
// focused on `App` behaviour rather than child implementation details.
vi.mock('./components/DetailPanel/DetailPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="detail-panel" />,
}));

describe('App component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders header and Upload button', () => {
    // Smoke test: ensure top-level header text and the Upload button are present
    render(<App />);
    expect(screen.getByText('OPC UA Web Modeler')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeTruthy();
  });

  it('shows empty workspace text when no nodeset loaded', () => {
    // With no nodeset provided, App should render the empty-workspace message
    render(<App />);
    expect(screen.getByText('No nodeset loaded')).toBeTruthy();
  });

  it('opens import dialog when Upload button is clicked', () => {
    // Clicking the Upload button should call showModal
    render(<App />);
    const btn = screen.getByRole('button', { name: 'Upload nodeset' });
    fireEvent.click(btn);
    // Verify showModal was called
    expect(showModal).toHaveBeenCalled();
  });
});