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
      const response = await adminAPI.getBatches();
      const payload = response?.data?.data;
      const items = Array.isArray(payload) ? payload : (payload?.data || []);
      setBatches(items);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

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
      header: 'Activate',
      accessor: 'toggle',
      render: (batch) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!batch.isActive}
            onChange={() => handleToggleActive(batch)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:bg-primary-500 relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      ),
    },
  ], []);

  const activeBatchId = batches.find((b) => b.isActive)?._id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-600 mt-1">Manage student batches. Multiple batches can be active simultaneously.</p>
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
        <Table
          columns={columns}
          data={batches.map((b) => ({
            ...b,
            rowClass: b.isActive ? 'bg-green-50' : '',
          }))}
          loading={loading}
          emptyMessage="No batches found"
        />
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
