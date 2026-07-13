import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
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

  const verifyUrl = (certificateNumber) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    return `${base}/certificates/verify/${certificateNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-base">My Certificates</h1>
        <p className="text-sm text-text-muted mt-1">View, download, and share your issued certificates.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {certificates.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-text-subtle">No certificates issued yet. Complete courses to become eligible.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate._id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-base">{certificate.certificateName || 'Certificate'}</h3>
                  <p className="text-sm text-text-muted">{certificate.certificateNumber}</p>
                </div>
                <Badge variant="success">Issued</Badge>
              </div>
              <div className="text-sm text-text-muted space-y-1">
                <p>Batch: {certificate.batchId?.name || 'N/A'}</p>
                <p>Duration: {certificate.duration || 'N/A'}</p>
                <p>Completed: {certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString() : 'N/A'}</p>
                <p>Issued: {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button
                  variant="primary"
                  onClick={() => handleDownload(certificate)}
                  disabled={downloading === certificate.certificateNumber}
                >
                  {downloading === certificate.certificateNumber ? 'Downloading...' : 'Download PDF'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
