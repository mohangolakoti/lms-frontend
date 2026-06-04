import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { useBatches } from '../../hooks/useBatches';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import MultiSelect from '../../components/MultiSelect';

const Announcements = () => {
  const { batches } = useBatches();
  const { announcements, loading, error: fetchError, deleteAnnouncement, fetchAnnouncements } = useAnnouncements();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'global',
    batchIds: [],
    deliveryChannels: [],
    scheduledAt: '',
    expiresAt: '',
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      setFormError('Message is required');
      return;
    }

    if (formData.deliveryChannels.length === 0) {
      setFormError('At least one delivery channel must be selected');
      return;
    }

    if (formData.targetType === 'batch' && formData.batchIds.length === 0) {
      setFormError('Please select at least one batch');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        targetType: formData.targetType,
        deliveryChannels: formData.deliveryChannels,
        scheduledAt: formData.scheduledAt || undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      if (formData.targetType === 'batch') {
        payload.batchIds = formData.batchIds;
      }

      await adminAPI.createAnnouncement(payload);
      setSuccess('Announcement created successfully! Notifications are being sent.');
      setFormData({
        title: '',
        message: '',
        targetType: 'global',
        batchIds: [],
        deliveryChannels: [],
        scheduledAt: '',
        expiresAt: '',
      });
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        fetchAnnouncements();
      }, 1500);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement? Associated notifications will also be removed.')) {
      setDeleting(id);
      const result = await deleteAnnouncement(id);
      setDeleting(null);
      if (result.success) {
        setSuccess('Announcement deleted successfully!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setFormError(result.error || 'Failed to delete announcement');
      }
    }
  };

  const getTargetDisplay = (announcement) => {
    if (announcement.targetType === 'global') {
      return 'All Students';
    }
    if (announcement.batchIds && announcement.batchIds.length > 0) {
      return announcement.batchIds.map(b => b.name).join(', ');
    }
    return 'N/A';
  };

  const getChannelsDisplay = (channels) => {
    return channels.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
  };

  const getDeliveryStat = (announcement, channel, key) => {
    return announcement?.deliveryStats?.[channel]?.[key] ?? 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Button onClick={() => setShowModal(true)}>Create Announcement</Button>
      </div>

      <Card>
        <p className="text-gray-600">
          Create announcements to communicate with students. You can target all students globally or select specific batches. 
          Choose delivery channels: Portal (In-LMS), Email, or WhatsApp.
        </p>
      </Card>

      {/* Announcements List */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && announcements.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">No announcements yet.</p>
        </Card>
      )}

      {!loading && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.message}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Target:</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {getTargetDisplay(announcement)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Channels:</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getChannelsDisplay(announcement.deliveryChannels)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Created:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  {announcement.scheduledAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Scheduled:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {['portal', 'email', 'whatsapp'].map((channel) => (
                      <div key={channel} className="bg-surface-muted border border-line-soft rounded px-2 py-1">
                        <span className="font-medium text-text-base">{channel.toUpperCase()}</span>
                        <span className="text-gray-600 ml-2">
                          Sent: {getDeliveryStat(announcement, channel, 'sent')}
                          {' • '}Failed: {getDeliveryStat(announcement, channel, 'failed')}
                          {' • '}Opt-out: {getDeliveryStat(announcement, channel, 'skipped_opt_out')}
                          {' • '}No contact: {getDeliveryStat(announcement, channel, 'skipped_no_contact')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(announcement._id)}
                  disabled={deleting === announcement._id}
                  className="py-1 px-3 text-sm"
                >
                  {deleting === announcement._id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: '',
            message: '',
            targetType: 'global',
            batchIds: [],
            deliveryChannels: [],
            scheduledAt: '',
            expiresAt: '',
          });
          setFormError('');
          setSuccess('');
        }}
        title="Create Announcement"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter announcement title"
            required
          />
          <Textarea
            label="Message"
            name="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Enter announcement message"
            required
            rows={6}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Schedule At (Optional)"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            />
            <Input
              label="Expires At (Optional)"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          {/* Target Type Selection */}
          <Select
            label="Target Type"
            name="targetType"
            value={formData.targetType}
            onChange={(e) => setFormData({ ...formData, targetType: e.target.value, batchIds: [] })}
            options={[
              { value: 'global', label: 'Global (All Students)' },
              { value: 'batch', label: 'Batch Specific' },
            ]}
            required
          />

          {/* Batch Selection (only for batch-specific) */}
          {formData.targetType === 'batch' && (
            <MultiSelect
              label="Select Batches"
              name="batchIds"
              value={formData.batchIds}
              onChange={(value) => setFormData({ ...formData, batchIds: value })}
              options={batches.map((batch) => ({
                value: batch._id,
                label: batch.name,
              }))}
              required
            />
          )}

          {/* Delivery Channels */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-3">Delivery Channels</label>
            <div className="space-y-2">
              {['portal', 'email', 'whatsapp'].map((channel) => (
                <div key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`channel-${channel}`}
                    name={`channel-${channel}`}
                    checked={formData.deliveryChannels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          deliveryChannels: [...formData.deliveryChannels, channel],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          deliveryChannels: formData.deliveryChannels.filter(c => c !== channel),
                        });
                      }
                    }}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-line-soft rounded"
                  />
                  <label htmlFor={`channel-${channel}`} className="ml-2 block text-sm text-gray-900">
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    {channel === 'portal' && ' (In-LMS Portal)'}
                    {channel === 'email' && ' (Email delivery)'}
                    {channel === 'whatsapp' && ' (WhatsApp messages)'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;

