import React, { useState } from "react";
import { callAiAdvice } from "../api/ai";
import type { AiAdviceResponse } from "../types/ai";

interface Props {
  token: string;
}

export const DoctorAiAssistPanel: React.FC<Props> = ({ token }) => {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [loading,   setLoading] = useState(false);
  const [error,     setError] = useState<string | null>(null);
  const [result,    setResult] = useState<AiAdviceResponse | null>(null);

  const handleAsk = async () => {
    setLoading(true);
    setError(null);
    setResult(null); // Clear previous result
    try {
      const response = await callAiAdvice({ 
        query, 
        topK: 10,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined
      }, token);
      setResult(response);
    } catch (e: any) {
      setError(e.message ?? "AI assist failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Patient symptoms / clinical question
        </label>
        <textarea
          className="w-full border rounded-md p-2 text-sm"
          rows={3}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. Chest pain, shortness of breath, history of hypertension..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Gender (Optional)
          </label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={gender}
            onChange={e => setGender(e.target.value)}
          >
            <option value="">Any</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Age (Optional)
          </label>
          <input
            type="number"
            className="w-full border rounded-md p-2 text-sm"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="e.g. 64"
            min="0"
            max="120"
          />
        </div>
      </div>

      <button
        onClick={handleAsk}
        disabled={loading || !query.trim()}
        className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-medium disabled:opacity-50 hover:bg-teal-600 transition-colors"
      >
        {loading ? "🤖 Analyzing with AI..." : "🤖 Get AI Clinical Advice"}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {/* Gemini AI Advice Section */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✨</span>
              <h3 className="text-lg font-semibold text-blue-900">AI Clinical Decision Support</h3>
              <span className="ml-auto px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Powered by Gemini</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line">
              {result.adviceText}
            </div>
          </div>

          {/* Cohort Evidence Section */}
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-900">MIMIC-III Cohort Evidence</h3>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {result.cohortSummary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
