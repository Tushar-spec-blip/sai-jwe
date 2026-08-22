import { HardDrive, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function BackupRestore() {
  const lastBackup = '2026-08-20 10:30 AM';
  const backupLocation = 'C:\\Sri Sai Jewels\\Backups\\';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Backup & Restore</h2>
          <p>Protect your data with regular backups</p>
        </div>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Phase 1.7 Notice:</strong> Database backup & export functionality will be available after the local database (SQLite) is connected in Phase 2.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Backup */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(201,168,76,0.12)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={18} color="var(--gold)" />
              </div>
              <h3>Create Backup</h3>
            </div>
          </div>
          <div className="card-body">
            <div style={{ background: 'var(--cream)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Last Backup Status</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Demo Mode (In-Memory Data)</div>
            </div>
            <div style={{ background: 'var(--cream)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Location</div>
              <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-medium)' }}>{backupLocation}</div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 12, opacity: 0.7, cursor: 'not-allowed' }}
              onClick={() => alert('Database backup will be available after the local database is connected.')}
              title="Database backup will be available after the local database is connected."
            >
              <Download size={16} /> Create Backup (Available in Phase 2)
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
              Database backup will be available after the local database is connected.
            </p>
          </div>
        </div>

        {/* Restore */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="#dc2626" />
              </div>
              <h3>Restore Backup</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              <AlertCircle size={14} />
              <div style={{ fontSize: 12 }}>
                <strong>Note:</strong> Database restore will be active once SQLite is connected in Phase 2.
              </div>
            </div>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center', marginBottom: 16, background: 'var(--cream)', cursor: 'not-allowed', opacity: 0.7 }}
              onClick={() => alert('Database restore will be available after the local database is connected.')}>
              <HardDrive size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-medium)', marginBottom: 4 }}>Select Backup File</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Will browse for .db backup files in Phase 2</div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: 12, opacity: 0.7, cursor: 'not-allowed' }}
              onClick={() => alert('Database restore will be available after the local database is connected.')}
              title="Database restore will be available after the local database is connected."
            >
              <Upload size={16} /> Restore Selected Backup (Phase 2)
            </button>
          </div>
        </div>
      </div>

      {/* Backup History Placeholder */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>Backup History</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full backup history in Phase 2</span>
        </div>
        <div className="card-body">
          {[
            { date: '2026-08-20 10:30 AM', size: '2.4 MB', status: 'Success' },
            { date: '2026-08-13 11:15 AM', size: '2.1 MB', status: 'Success' },
            { date: '2026-08-06 09:45 AM', size: '1.9 MB', status: 'Success' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{b.date}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Size: {b.size}</div>
                </div>
              </div>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
