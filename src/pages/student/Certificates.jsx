import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Button from '../../components/Button';
import { studentAPI } from '../../services/api';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getMyCertificates();
      setCertificates(response?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (certificate) => {
    try {
      setDownloading(certificate.certificateNumber);
      const response = await studentAPI.downloadCertificate(certificate.certificateNumber);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to download certificate');
    } finally {
      setDownloading('');
    }
  };

  const columns = [
    {
      header: 'Certificate #',
      accessor: 'certificateNumber',
      render: (row) => <span className="font-medium text-gray-900">{row.certificateNumber}</span>,
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
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <Button
          variant="primary"
          className="text-xs py-1 px-3"
          onClick={() => handleDownload(row)}
          disabled={downloading === row.certificateNumber}
        >
          {downloading === row.certificateNumber ? 'Downloading...' : 'Download PDF'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-sm text-gray-600 mt-1">View and download all issued certificates.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={certificates}
          loading={loading}
          emptyMessage="No certificates issued yet"
        />
      </Card>
    </div>
  );
};

export default Certificates;
