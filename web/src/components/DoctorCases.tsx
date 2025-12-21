import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
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
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  prescriptions: Prescription[];
}

interface Diagnosis {
  id: string;
  icd9Code?: string;
  diagnosis: string;
  createdAt: string;
}

interface Procedure {
  id: string;
  icd9Code?: string;
  procedureDescription: string;
  createdAt: string;
}

interface Prescription {
  id: string;
  drugName: string;
  doseValue: string;
  doseUnit: string;
  route: string;
  createdAt: string;
}

export function DoctorCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-center py-8">Loading cases...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {cases.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No cases assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((caseData) => (
            <CaseCard
              key={caseData.caseId}
              caseData={caseData}
              isExpanded={expandedCaseId === caseData.caseId}
              onToggle={() =>
                setExpandedCaseId(
                  expandedCaseId === caseData.caseId ? null : caseData.caseId
                )
              }
              onEdit={() => setSelectedCaseForEdit(caseData.caseId)}
              onRefresh={fetchCases}
            />
          ))}
        </div>
      )}

      {selectedCaseForEdit && (
        <CaseEditModal
          caseId={selectedCaseForEdit}
          onClose={() => setSelectedCaseForEdit(null)}
          onSuccess={() => {
            setSelectedCaseForEdit(null);
            fetchCases();
          }}
        />
      )}
    </div>
  );
}

function CaseCard({
  caseData,
  isExpanded,
  onToggle,
  onEdit,
  onRefresh,
}: {
  caseData: Case;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              Case {caseData.caseId.substring(0, 8)}
            </h3>
            <p className="text-sm text-gray-600">
              Patient: {caseData.subjectCode.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 text-xs rounded">
            {caseData.diagnoses?.length || 0} Dx
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-1 text-xs rounded">
            {caseData.procedures?.length || 0} Px
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-1 text-xs rounded">
            {caseData.prescriptions?.length || 0} Rx
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Case Timeline */}
          <CaseTimeline caseData={caseData} />

          {/* Clinical Summary */}
          <ClinicalSummary caseData={caseData} />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onEdit}
              className="flex-1 bg-medical-600 text-white px-3 py-2 rounded-lg hover:bg-medical-700 font-medium"
            >
              Edit Clinical Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CaseTimeline({ caseData }: { caseData: Case }) {
  const events = [
    { date: caseData.createdAt, title: 'Case Created', type: 'created' },
    ...caseData.diagnoses.map((d) => ({
      date: d.createdAt,
      title: `Diagnosis: ${d.diagnosis}`,
      type: 'diagnosis',
    })),
    ...caseData.procedures.map((p) => ({
      date: p.createdAt,
      title: `Procedure: ${p.procedureDescription}`,
      type: 'procedure',
    })),
    ...caseData.prescriptions.map((r) => ({
      date: r.createdAt,
      title: `Prescribed: ${r.drugName}`,
      type: 'prescription',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Case Timeline</h4>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-600">No events yet</p>
        ) : (
          events.slice(0, 5).map((event, idx) => (
            <div key={idx} className="flex gap-3 text-sm">
              <div className="flex-shrink-0">
                {event.type === 'created' && (
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5" />
                )}
                {event.type === 'diagnosis' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                )}
                {event.type === 'procedure' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                )}
                {event.type === 'prescription' && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-700">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
        {events.length > 5 && (
          <p className="text-xs text-gray-500">+{events.length - 5} more events</p>
        )}
      </div>
    </div>
  );
}

function ClinicalSummary({ caseData }: { caseData: Case }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Clinical Summary</h4>

      <div className="space-y-3">
        {/* Active Diagnoses */}
        {caseData.diagnoses && caseData.diagnoses.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Active Diagnoses</p>
            <ul className="space-y-1">
              {caseData.diagnoses.slice(0, 3).map((d) => (
                <li key={d.id} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  {d.icd9Code && (
                    <span className="font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded">
                      {d.icd9Code}
                    </span>
                  )}
                  <span>{d.diagnosis}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Medications */}
        {caseData.prescriptions && caseData.prescriptions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Current Medications</p>
            <ul className="space-y-1">
              {caseData.prescriptions.slice(0, 3).map((r) => (
                <li key={r.id} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {r.drugName} - {r.doseValue} {r.doseUnit} ({r.route})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Performed Procedures */}
        {caseData.procedures && caseData.procedures.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Procedures Performed</p>
            <ul className="space-y-1">
              {caseData.procedures.slice(0, 3).map((p) => (
                <li key={p.id} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {p.icd9Code && (
                    <span className="font-mono text-xs bg-green-50 px-1.5 py-0.5 rounded">
                      {p.icd9Code}
                    </span>
                  )}
                  <span>{p.procedureDescription}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CaseEditModal({
  caseId,
  onClose,
  onSuccess,
}: {
  caseId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'diagnoses' | 'procedures' | 'prescriptions'>(
    'diagnoses'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Edit Clinical Data</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {(['diagnoses', 'procedures', 'prescriptions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-medical-600 text-medical-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'diagnoses' && <DiagnosisTab caseId={caseId} />}
          {activeTab === 'procedures' && <ProcedureTab caseId={caseId} />}
          {activeTab === 'prescriptions' && <PrescriptionTab caseId={caseId} />}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DiagnosisTab({ caseId }: { caseId: string }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [icd9Code, setIcd9Code] = useState('');
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      const response = await axiosClient.get(`/api/cases/${caseId}/diagnoses`);
      setDiagnoses(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!diagnosis.trim()) return;
    try {
      await axiosClient.post(`/api/cases/${caseId}/diagnoses`, {
        diagnosis,
        icd9Code: icd9Code || undefined,
      });
      setDiagnosis('');
      setIcd9Code('');
      await fetchDiagnoses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this diagnosis?')) return;
    try {
      await axiosClient.delete(`/api/cases/${caseId}/diagnoses/${id}`);
      await fetchDiagnoses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="ICD-9 Code (optional)"
          value={icd9Code}
          onChange={(e) => setIcd9Code(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Diagnosis
        </button>
      </div>

      <div className="space-y-2">
        {diagnoses.map((d) => (
          <div key={d.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div>
              {d.icd9Code && <span className="font-mono text-xs">{d.icd9Code}</span>}
              <p className="text-sm">{d.diagnosis}</p>
            </div>
            <button
              onClick={() => handleDelete(d.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcedureTab({ caseId }: { caseId: string }) {
  const [procedureDescription, setProcedureDescription] = useState('');
  const [icd9Code, setIcd9Code] = useState('');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const response = await axiosClient.get(`/api/cases/${caseId}/procedures`);
      setProcedures(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!procedureDescription.trim()) return;
    try {
      await axiosClient.post(`/api/cases/${caseId}/procedures`, {
        procedureDescription,
        icd9Code: icd9Code || undefined,
      });
      setProcedureDescription('');
      setIcd9Code('');
      await fetchProcedures();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this procedure?')) return;
    try {
      await axiosClient.delete(`/api/cases/${caseId}/procedures/${id}`);
      await fetchProcedures();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="ICD-9 Code (optional)"
          value={icd9Code}
          onChange={(e) => setIcd9Code(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Procedure Description"
          value={procedureDescription}
          onChange={(e) => setProcedureDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Procedure
        </button>
      </div>

      <div className="space-y-2">
        {procedures.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <div>
              {p.icd9Code && <span className="font-mono text-xs">{p.icd9Code}</span>}
              <p className="text-sm">{p.procedureDescription}</p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrescriptionTab({ caseId }: { caseId: string }) {
  const [drugName, setDrugName] = useState('');
  const [doseValue, setDoseValue] = useState('');
  const [doseUnit, setDoseUnit] = useState('');
  const [route, setRoute] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosClient.get(`/api/cases/${caseId}/prescriptions`);
      setPrescriptions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!drugName.trim() || !doseValue.trim()) return;
    try {
      await axiosClient.post(`/api/cases/${caseId}/prescriptions`, {
        drugName,
        doseValue,
        doseUnit,
        route,
      });
      setDrugName('');
      setDoseValue('');
      setDoseUnit('');
      setRoute('');
      await fetchPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prescription?')) return;
    try {
      await axiosClient.delete(`/api/cases/${caseId}/prescriptions/${id}`);
      await fetchPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Drug Name"
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Dose Value"
            value={doseValue}
            onChange={(e) => setDoseValue(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Unit (mg, ml, etc)"
            value={doseUnit}
            onChange={(e) => setDoseUnit(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="Route (oral, IV, etc)"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Prescription
        </button>
      </div>

      <div className="space-y-2">
        {prescriptions.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
            <div className="text-sm">
              <p className="font-medium">{r.drugName}</p>
              <p className="text-gray-600">
                {r.doseValue} {r.doseUnit} - {r.route}
              </p>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
