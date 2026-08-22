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

      <div className="alert alert-warning" style={{ marginBottom: 24 }}>
        <AlertCircle size={16} />
        <div>
          <strong>Recommendation:</strong> Create a backup at least once a week. Store backup files on a USB drive or external storage for safety.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Last Backup</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{lastBackup}</div>
            </div>
            <div style={{ background: 'var(--cream)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Backup Location</div>
              <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-medium)' }}>{backupLocation}</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}
              onClick={() => alert('Backup functionality will be implemented in Phase 2. The backup will save the SQLite database file to the selected location.')}>
              <Download size={16} /> Create Backup Now
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
              Creates a copy of your complete database including all customers, invoices, and settings.
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
                <strong>Warning:</strong> Restoring will replace all current data with the backup data. This cannot be undone.
              </div>
            </div>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center', marginBottom: 16, background: 'var(--cream)', cursor: 'pointer' }}
              onClick={() => alert('File selection will open in Phase 2.')}>
              <HardDrive size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-medium)', marginBottom: 4 }}>Select Backup File</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to browse for a .db backup file</div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}
              onClick={() => alert('Restore functionality will be implemented in Phase 2.')}>
              <Upload size={16} /> Restore Selected Backup
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
