import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { adminAPI } from '../../services/api';

const DURATION_OPTIONS = ['2 Months', '4 Months', '6 Months'];

const Certificates = () => {
  const [templates, setTemplates] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificatePagination, setCertificatePagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [certificateJobs, setCertificateJobs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [generationResult, setGenerationResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    htmlTemplate: '',
    backgroundImage: null,
  });

  const [generationForm, setGenerationForm] = useState({
    mode: 'batch',
    batchId: '',
    studentId: '',
    templateId: '',
    certificateName: '',
    durationPreset: '',
    durationCustom: '',
    completionDate: '',
    forceRegenerate: false,
  });

  const [filters, setFilters] = useState({
    batchId: '',
    studentId: '',
    certificateName: '',
    page: 1,
    limit: 20,
  });

  const loadReferenceData = async () => {
    try {
      setLoading(true);
      setError('');

      const [templateRes, batchRes, studentRes] = await Promise.all([
        adminAPI.getCertificateTemplates(),
        adminAPI.getBatches({ limit: 100 }),
        adminAPI.getStudents(),
      ]);

      setTemplates(templateRes?.data?.data || []);

      const batchPayload = batchRes?.data?.data;
      setBatches(Array.isArray(batchPayload) ? batchPayload : (batchPayload?.data || []));

      setStudents(studentRes?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load certificate module data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [filters.batchId, filters.studentId, filters.certificateName, filters.page, filters.limit]);

  useEffect(() => {
    fetchCertificateJobs();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const getDurationText = () => {
    if (generationForm.durationCustom.trim()) return generationForm.durationCustom.trim();
    return generationForm.durationPreset;
  };

  const validateGenerationForm = () => {
    if (!generationForm.templateId) {
      setError('Please select a certificate template');
      return false;
    }

    if (!generationForm.certificateName.trim()) {
      setError('Certificate name is required');
      return false;
    }

    const durationText = getDurationText();
    if (!durationText) {
      setError('Please select or enter a duration');
      return false;
    }

    if (generationForm.mode === 'batch' && !generationForm.batchId) {
      setError('Please select a batch for batch mode');
      return false;
    }

    if (generationForm.mode === 'individual' && !generationForm.studentId) {
      setError('Please select a student for individual mode');
      return false;
    }

    return true;
  };

  const buildGenerationPayload = () => {
    const payload = {
      mode: generationForm.mode,
      templateId: generationForm.templateId,
      certificateName: generationForm.certificateName.trim(),
      durationText: getDurationText(),
      forceRegenerate: generationForm.forceRegenerate,
    };

    if (generationForm.mode === 'batch') payload.batchId = generationForm.batchId;
    if (generationForm.mode === 'individual') payload.studentId = generationForm.studentId;
    if (generationForm.completionDate) payload.completionDate = generationForm.completionDate;

    return payload;
  };

  const payloadHash = (payload) => JSON.stringify(payload);

  const handlePreview = async () => {
    if (!validateGenerationForm()) return;

    try {
      setPreviewing(true);
      setError('');

      const payload = buildGenerationPayload();
      const response = await adminAPI.previewCertificate(payload);
      const data = response?.data?.data;

      setPreviewData({
        ...data,
        payload,
        payloadHash: payloadHash(payload),
      });
      setShowPreviewModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to preview certificate');
    } finally {
      setPreviewing(false);
    }
  };

  const handleOpenConfirm = () => {
    if (!previewData) {
      setError('Please preview certificates before generating');
      return;
    }

    const currentPayload = buildGenerationPayload();
    if (previewData.payloadHash !== payloadHash(currentPayload)) {
      setError('Generation settings changed. Please preview again before generating');
      return;
    }

    setShowPreviewModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setGenerationResult(null);

      const payload = buildGenerationPayload();
      const response = await adminAPI.generateCertificates(payload);
      const jobId = response?.data?.data?.jobId;
      if (!jobId) {
        throw new Error('Invalid generation job response');
      }

      const pollingStartedAt = Date.now();
      const maxPollingMs = 10 * 60 * 1000;
      let done = false;
      let pollDelayMs = 1500;

      while (!done && Date.now() - pollingStartedAt <= maxPollingMs) {
        const jobRes = await adminAPI.getCertificateJob(jobId);
        const job = jobRes?.data?.data;
        if (job?.status === 'completed') {
          setGenerationResult(job.result || null);
          done = true;
          showToast('Certificates generated successfully');
          break;
        }
        if (job?.status === 'failed') {
          throw new Error(job.error || 'Certificate generation job failed');
        }

        await new Promise((resolve) => setTimeout(resolve, pollDelayMs));
        pollDelayMs = Math.min(pollDelayMs + 750, 5000);
      }

      if (!done) {
        throw new Error(`Certificate generation is still processing. Track job ID: ${jobId}`);
      }

      await fetchCertificates();
      await fetchCertificateJobs();
      setShowConfirmModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Certificate generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await adminAPI.getCertificates({
        batchId: filters.batchId || undefined,
        studentId: filters.studentId || undefined,
        certificateName: filters.certificateName || undefined,
        page: filters.page,
        limit: filters.limit,
      });
      const payload = response?.data?.data;
      setCertificates(payload?.items || []);
      setCertificatePagination(payload?.pagination || {
        page: 1,
        limit: filters.limit,
        total: 0,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch certificates');
    }
  };

  const fetchCertificateJobs = async () => {
    try {
      const response = await adminAPI.getCertificateJobs({ limit: 10 });
      const payload = response?.data?.data;
      setCertificateJobs(payload?.items || []);
    } catch (err) {
      // Non-blocking fetch
    }
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();

    if (!templateForm.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!templateForm.backgroundImage) {
      setError('Template background image is required');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', templateForm.name.trim());
      formData.append('backgroundImage', templateForm.backgroundImage);
      if (templateForm.htmlTemplate.trim()) {
        formData.append('htmlTemplate', templateForm.htmlTemplate);
      }

      await adminAPI.createCertificateTemplate(formData);
      showToast('Certificate template uploaded successfully');
      setTemplateForm({ name: '', htmlTemplate: '', backgroundImage: null });
      await loadReferenceData();
      await fetchCertificates();
      await fetchCertificateJobs();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleRevokeCertificate = async (certificate) => {
    const reason = window.prompt('Enter revocation reason (optional):') || '';
    if (!window.confirm(`Revoke certificate ${certificate.certificateNumber}?`)) {
      return;
    }
    try {
      await adminAPI.revokeCertificate(certificate._id, reason);
      showToast('Certificate revoked successfully');
      await fetchCertificates();
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to revoke certificate');
    }
  };

  const certificateColumns = useMemo(() => ([
    {
      header: 'Certificate #',
      accessor: 'certificateNumber',
      render: (row) => <span className="font-medium">{row.certificateNumber}</span>,
    },
    {
      header: 'Student',
      accessor: 'studentId',
      render: (row) => row.studentId?.name || 'N/A',
    },
    {
      header: 'Certificate Name',
      accessor: 'certificateName',
      render: (row) => row.certificateName || 'N/A',
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => row.duration || 'N/A',
    },
    {
      header: 'Batch',
      accessor: 'batchId',
      render: (row) => row.batchId?.name || 'N/A',
    },
    {
      header: 'Completion Date',
      accessor: 'completionDate',
      render: (row) => row.completionDate ? new Date(row.completionDate).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Verification',
      accessor: 'verify',
      render: (row) => (
        <Badge variant={row.isRevoked ? 'danger' : 'info'}>
          {row.isRevoked ? 'Revoked' : `/verify/${row.certificateNumber}`}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <Button
          variant="danger"
          className="text-xs px-2 py-1"
          disabled={row.isRevoked}
          onClick={() => handleRevokeCertificate(row)}
        >
          Revoke
        </Button>
      ),
    },
  ]), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-sm text-gray-600 mt-1">Upload templates and generate certificates in bulk by batch.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card title="Upload Certificate Template">
        <form onSubmit={handleTemplateUpload} className="space-y-4">
          <Input
            label="Template Name"
            value={templateForm.name}
            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setTemplateForm({ ...templateForm, backgroundImage: file });
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            />
          </div>

          <Textarea
            label="HTML Template (Optional)"
            value={templateForm.htmlTemplate}
            onChange={(e) => setTemplateForm({ ...templateForm, htmlTemplate: e.target.value })}
            rows={10}
            placeholder="Use placeholders: {{student_name}}, {{certificate_name}}, {{batch_name}}, {{duration}}, {{completion_date}}, {{certificate_id}}"
          />

          <div className="text-xs text-gray-500 space-y-1">
            <p>Supported placeholders: {'{{student_name}}'}, {'{{certificate_name}}'}, {'{{batch_name}}'}, {'{{duration}}'}, {'{{completion_date}}'}, {'{{certificate_id}}'}</p>
            <p>Optional placeholder for background in custom HTML: {'{{background_image}}'}</p>
          </div>

          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Template'}
          </Button>
        </form>
      </Card>

      <Card title="Generate Certificates">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${generationForm.mode === 'batch' ? 'bg-brand-600 text-white' : 'bg-white text-text-muted'}`}
              onClick={() => setGenerationForm({ ...generationForm, mode: 'batch', studentId: '' })}
            >
              Batch
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${generationForm.mode === 'individual' ? 'bg-brand-600 text-white' : 'bg-white text-text-muted'}`}
              onClick={() => setGenerationForm({ ...generationForm, mode: 'individual', batchId: '' })}
            >
              Individual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generationForm.mode === 'batch' ? (
              <Select
                label="Batch"
                value={generationForm.batchId}
                onChange={(e) => setGenerationForm({ ...generationForm, batchId: e.target.value })}
                options={[
                  { value: '', label: 'Select batch' },
                  ...batches.map((batch) => ({ value: batch._id, label: batch.name })),
                ]}
                required
              />
            ) : (
              <Select
                label="Student"
                value={generationForm.studentId}
                onChange={(e) => {
                  const selectedStudentId = e.target.value;
                  const selectedStudent = students.find((student) => student._id === selectedStudentId);
                  setGenerationForm({
                    ...generationForm,
                    studentId: selectedStudentId,
                    batchId: selectedStudent?.batchId?._id || selectedStudent?.batchId || generationForm.batchId,
                  });
                }}
                options={[
                  { value: '', label: 'Select student' },
                  ...students.map((student) => ({ value: student._id, label: `${student.name} (${student.email})` })),
                ]}
                required
              />
            )}

            <Select
              label="Template"
              value={generationForm.templateId}
              onChange={(e) => setGenerationForm({ ...generationForm, templateId: e.target.value })}
              options={[
                { value: '', label: 'Select template' },
                ...templates.map((template) => ({ value: template._id, label: template.name })),
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Certificate Name"
              value={generationForm.certificateName}
              onChange={(e) => setGenerationForm({ ...generationForm, certificateName: e.target.value })}
              placeholder="Full Stack Internship Completion"
              required
            />

            <Select
              label="Duration"
              value={generationForm.durationPreset}
              onChange={(e) => setGenerationForm({ ...generationForm, durationPreset: e.target.value })}
              options={[
                { value: '', label: 'Select duration' },
                ...DURATION_OPTIONS.map((option) => ({ value: option, label: option })),
              ]}
              required
            />
          </div>

          <Input
            label="Custom Duration (Optional)"
            value={generationForm.durationCustom}
            onChange={(e) => setGenerationForm({ ...generationForm, durationCustom: e.target.value })}
            placeholder="e.g. 3 Months, 6 Weeks"
          />

          <Input
            label="Completion Date (Optional)"
            type="date"
            value={generationForm.completionDate}
            onChange={(e) => setGenerationForm({ ...generationForm, completionDate: e.target.value })}
          />

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={generationForm.forceRegenerate}
              onChange={(e) => setGenerationForm({ ...generationForm, forceRegenerate: e.target.checked })}
            />
            Regenerate certificates if they already exist
          </label>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={previewing || loading} onClick={handlePreview}>
              {previewing ? 'Preparing Preview...' : 'Preview'}
            </Button>
            <Button type="button" disabled={generating || loading} onClick={handleOpenConfirm}>
              {generating ? 'Generating Certificates...' : 'Generate'}
            </Button>
          </div>
        </form>

        {generationResult && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
            <div className="flex flex-wrap gap-4">
              <span><strong>Generated:</strong> {generationResult.generatedCount}</span>
              <span><strong>Skipped:</strong> {generationResult.skippedCount}</span>
              <span><strong>Errors:</strong> {generationResult.errorCount}</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="Issued Certificates">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Filter by Batch"
            value={filters.batchId}
            onChange={(e) => setFilters({ ...filters, batchId: e.target.value, page: 1 })}
            options={[
              { value: '', label: 'All batches' },
              ...batches.map((batch) => ({ value: batch._id, label: batch.name })),
            ]}
          />

          <Select
            label="Filter by Student"
            value={filters.studentId}
            onChange={(e) => setFilters({ ...filters, studentId: e.target.value, page: 1 })}
            options={[
              { value: '', label: 'All students' },
              ...students.map((student) => ({ value: student._id, label: student.name })),
            ]}
          />

          <Input
            label="Filter by Certificate Name"
            value={filters.certificateName}
            onChange={(e) => setFilters({ ...filters, certificateName: e.target.value, page: 1 })}
            placeholder="Search certificate name"
          />
        </div>

        <Table
          columns={certificateColumns}
          data={certificates}
          loading={loading}
          emptyMessage="No certificates generated yet"
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-text-subtle">
            Showing page {certificatePagination.page || 1} of {certificatePagination.pages || 1}
            {' '}({certificatePagination.total || 0} certificates)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!certificatePagination.hasPrevPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="text-xs px-3 py-1"
              disabled={!certificatePagination.hasNextPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Recent Certificate Jobs">
        <Table
          columns={[
            { header: 'Job ID', accessor: '_id', render: (job) => String(job._id).slice(-8) },
            {
              header: 'Status',
              accessor: 'status',
              render: (job) => (
                <Badge
                  variant={
                    job.status === 'completed'
                      ? 'success'
                      : job.status === 'failed'
                        ? 'danger'
                        : job.status === 'processing'
                          ? 'warning'
                          : 'info'
                  }
                >
                  {job.status}
                </Badge>
              ),
            },
            { header: 'Requested By', accessor: 'requestedBy', render: (job) => job.requestedBy?.name || 'N/A' },
            { header: 'Created', accessor: 'createdAt', render: (job) => new Date(job.createdAt).toLocaleString() },
          ]}
          data={certificateJobs}
          loading={false}
          emptyMessage="No recent jobs"
        />
      </Card>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Certificate Preview"
        size="xl"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Cancel</Button>
            <Button onClick={handleOpenConfirm}>Continue</Button>
          </div>
        }
      >
        {previewData && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
              {previewData.note}
            </div>
            <iframe
              title="certificate-preview"
              className="w-full h-[580px] border border-gray-200 rounded-lg"
              srcDoc={previewData.renderedHtml}
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Certificate Generation"
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Confirm & Generate'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700 text-sm">Are you sure you want to generate certificates?</p>
      </Modal>

      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Certificates;
