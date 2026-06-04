import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ action: '', page: 1, limit: 20 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs(filters);
      setLogs(response?.data?.data || []);
      setPagination(response?.data?.pagination || pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.action, filters.page, filters.limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Audit Logs</h1>
        <Select
          value={filters.action}
          onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value, page: 1 }))}
          options={[
            { value: '', label: 'All actions' },
            { value: 'student.approved', label: 'Student Approved' },
            { value: 'student.rejected', label: 'Student Rejected' },
            { value: 'student.bulk.approve', label: 'Bulk Approve' },
            { value: 'announcement.created', label: 'Announcement Created' },
            { value: 'certificate.revoked', label: 'Certificate Revoked' },
          ]}
        />
      </div>

      <Card>
        <Table
          columns={[
            { header: 'Action', accessor: 'action' },
            { header: 'Actor', accessor: 'actorId', render: (row) => row.actorId?.name || row.actorId?.email || 'N/A' },
            { header: 'Entity', accessor: 'entityType', render: (row) => `${row.entityType}:${row.entityId}` },
            { header: 'Time', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
          ]}
          data={logs}
          loading={loading}
          emptyMessage="No audit logs found"
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-text-subtle">
            Showing page {pagination.page || 1} of {pagination.pages || 1}
            {' '}({pagination.total || 0} logs)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!pagination.hasPrevPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!pagination.hasNextPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;
