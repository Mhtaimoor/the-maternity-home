'use client';

import Link from 'next/link';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="tmh-topbar">
      <div className="tmh-topbar-content">
        <h1 className="tmh-brand tmh-topbar-title">{title}</h1>
        {subtitle ? <p className="tmh-topbar-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="tmh-topbar-actions d-flex gap-2 flex-wrap">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || 'unknown').toLowerCase();
  return <span className={`tmh-badge tmh-badge-${v}`}>{value}</span>;
}

export function EmptyState({
  icon = 'bi-inbox',
  title,
  text,
}: {
  icon?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="tmh-empty">
      <i className={`bi ${icon}`} />
      <div className="fw-semibold text-white mb-1">{title}</div>
      {text ? <div className="small text-secondary">{text}</div> : null}
    </div>
  );
}

export function DataPanel({
  title,
  actions,
  toolbar,
  footer,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="tmh-panel">
      {title ? (
        <div className="tmh-panel-head">
          <h2 className="tmh-panel-title">{title}</h2>
          {actions && <div className="tmh-panel-actions">{actions}</div>}
        </div>
      ) : null}
      {toolbar}
      {children}
      {footer ? <div className="tmh-footer-note">{footer}</div> : null}
    </div>
  );
}

export function DataTable({
  headers,
  children,
  empty,
  minWidth = 560,
}: {
  headers: Array<{ label: string; className?: string; width?: string }>;
  children: React.ReactNode;
  empty?: React.ReactNode;
  minWidth?: number;
}) {
  const childList = Array.isArray(children) ? children : [children];
  const hasRows = childList.filter(Boolean).length > 0;

  return (
    <div className="tmh-table-container">
      {hasRows && (
        <div className="tmh-table-scroll-hint d-md-none">
          <i className="bi bi-arrows-expand-vertical me-1" style={{ transform: 'rotate(90deg)', display: 'inline-block' }} />
          <span>Scroll horizontally to view columns</span>
        </div>
      )}
      <div className="tmh-table-wrap">
        {hasRows ? (
          <table
            className="table tmh-table table-borderless align-middle mb-0"
            style={{ minWidth, width: '100%' }}
          >
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={`${h.label}-${i}`}
                    className={h.className}
                    style={h.width ? { width: h.width } : undefined}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        ) : (
          empty || <EmptyState title="No records yet" text="Nothing to show for this view." />
        )}
      </div>
    </div>
  );
}

export function SoftLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="row-link">
      {children}
    </Link>
  );
}
