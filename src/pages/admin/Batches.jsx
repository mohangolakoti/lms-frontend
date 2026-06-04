import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { adminAPI } from '../../services/api';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 10, includeDeleted: true });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getBatches(filters);
      const payload = response?.data?.data;
      const items = Array.isArray(payload) ? payload : (payload?.data || []);
      setBatches(items);
      setPagination(response?.data?.pagination || pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filters.page, filters.limit, filters.includeDeleted]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const name = newBatchName.trim();

    if (!name) {
      addToast('error', 'Batch name is required');
      return;
    }

    try {
      setSubmitting(true);
      console.log("creating batch", name);
      await adminAPI.createBatch({ name });
      console.log("created batch");
      addToast('success', 'Batch created successfully');
      setShowCreateModal(false);
      setNewBatchName('');
      await fetchBatches();
    } catch (err) {
      addToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (batch) => {
    try {
      console.log("toggling", batch);
      await adminAPI.updateBatchStatus(batch._id, !batch.isActive);
      addToast('success', `Batch ${!batch.isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchBatches();
    } catch (err) {
      console.log("error", err);
      addToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to update batch status');
    }
  };

  const handleDeleteBatch = async (batch) => {
    const dependencyMessage = `Students: ${batch.dependencyStats?.students || 0}, Courses: ${batch.dependencyStats?.courses || 0}`;
    if (!window.confirm(`Delete batch "${batch.name}"?\n${dependencyMessage}`)) {
      return;
    }

    try {
      await adminAPI.deleteBatch(batch._id);
      addToast('success', 'Batch deleted successfully');
      await fetchBatches();
    } catch (err) {
      addToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to delete batch');
    }
  };

  const handleRestoreBatch = async (batch) => {
    try {
      await adminAPI.restoreBatch(batch._id);
      addToast('success', 'Batch restored successfully');
      await fetchBatches();
    } catch (err) {
      addToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to restore batch');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessor: 'name',
      render: (batch) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{batch.name}</span>
          {batch.isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Active
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (batch) => (
        <Badge variant={batch.isActive ? 'success' : 'secondary'}>
          {batch.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (batch) => (
        <span className="text-gray-600">
          {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Dependencies',
      accessor: 'dependencyStats',
      render: (batch) => (
        <span className="text-text-subtle text-sm">
          {batch.dependencyStats?.students || 0} students · {batch.dependencyStats?.courses || 0} courses
        </span>
      ),
    },
    {
      header: 'Activate',
      accessor: 'toggle',
      render: (batch) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!batch.isActive}
            disabled={!!batch.isDeleted}
            onChange={() => handleToggleActive(batch)}
          />
          <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:bg-brand-600 relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-line-soft after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (batch) => (
        <div className="flex items-center gap-2">
          {batch.isDeleted ? (
            <Button variant="outline" className="text-xs px-2 py-1" onClick={() => handleRestoreBatch(batch)}>
              Restore
            </Button>
          ) : (
            <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDeleteBatch(batch)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ], [filters.page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="text-sm text-text-subtle mt-1">Manage batch lifecycle, dependencies, and activation status.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Create New Batch
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-text-subtle">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(e) => setFilters((prev) => ({ ...prev, includeDeleted: e.target.checked, page: 1 }))}
            />
            Show deleted batches
          </label>
        </div>
        <Table
          columns={columns}
          data={batches.map((b) => ({
            ...b,
            rowClass: b.isActive ? 'bg-green-50' : '',
          }))}
          loading={loading}
          emptyMessage="No batches found"
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-text-subtle">
            Showing page {pagination.page || 1} of {pagination.pages || 1}
            {' '}({pagination.total || 0} batches)
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => !submitting && setShowCreateModal(false)}
        title="Create New Batch"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateBatch} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g., Batch 2024"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Toasts */}
      <div className="fixed top-6 right-6 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Batches;
