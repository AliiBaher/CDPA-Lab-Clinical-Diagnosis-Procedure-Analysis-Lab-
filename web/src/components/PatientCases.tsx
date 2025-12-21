import { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Case {
  caseId: string;
  subjectCode: string;
  doctorId: string;
  doctorName?: string;
  gender: string;
  dob: string;
  episodeStart: string;
  episodeEnd?: string;
  createdAt: string;
  diagnoses: any[];
  procedures: any[];
  prescriptions: any[];
}

export function PatientCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/cases');
      setCases(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (formData: { gender: string; dob: string }) => {
    try {
      await axiosClient.post('/api/cases', {
        gender: formData.gender,
        dob: new Date(formData.dob).toISOString(),
      });
      setShowCreateModal(false);
      await fetchCases();
    } catch (err) {
      console.error('Failed to create case:', err);
      setError('Failed to create case');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading cases...</div>;
  }

  if (selectedCase) {
    return <CaseDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Cases</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {cases.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No cases yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseData) => (
            <div
              key={caseData.caseId}
              onClick={() => setSelectedCase(caseData)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-medical-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Case {caseData.caseId.substring(0, 8)}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {new Date(caseData.createdAt).toLocaleDateString()}
                  </p>
                  {caseData.doctorName && (
                    <p className="text-sm text-gray-600">Doctor: {caseData.doctorName}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex gap-2 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {caseData.diagnoses?.length || 0} diagnoses
                    </span>
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                      {caseData.procedures?.length || 0} procedures
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCaseModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCase}
        />
      )}
    </div>
  );
}

function CaseDetail({ caseData, onBack }: { caseData: Case; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-medical-600 hover:text-medical-700 font-medium"
      >
        ← Back to Cases
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Case Summary: {caseData.caseId.substring(0, 8)}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-semibold text-gray-900">{caseData.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-semibold text-gray-900">
              {new Date(caseData.dob).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Episode Start</p>
            <p className="font-semibold text-gray-900">
              {new Date(caseData.episodeStart).toLocaleDateString()}
            </p>
          </div>
          {caseData.episodeEnd && (
            <div>
              <p className="text-sm text-gray-600">Episode End</p>
              <p className="font-semibold text-gray-900">
                {new Date(caseData.episodeEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {caseData.doctorName && (
          <div className="bg-medical-50 border border-medical-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Assigned Doctor</p>
            <p className="font-semibold text-gray-900">{caseData.doctorName}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-900">
              {caseData.diagnoses?.length || 0}
            </p>
            <p className="text-sm text-blue-700">Diagnoses</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-900">
              {caseData.procedures?.length || 0}
            </p>
            <p className="text-sm text-green-700">Procedures</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-900">
              {caseData.prescriptions?.length || 0}
            </p>
            <p className="text-sm text-purple-700">Prescriptions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCaseModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { gender: string; dob: string }) => void;
}) {
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !dob) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ gender, dob });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Case</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
