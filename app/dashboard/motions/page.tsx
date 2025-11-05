'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MotionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'motion',
    state: 'CA',
    courtName: '',
    caseNumber: '',
    plaintiff: '',
    defendant: '',
    content: '',
    includeMeetAndConfer: false,
    includeSanctions: false,
    includeCertificate: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/motions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: formData.documentType,
          state: formData.state,
          caseInfo: {
            courtName: formData.courtName,
            caseNumber: formData.caseNumber || undefined,
            plaintiff: formData.plaintiff,
            defendant: formData.defendant,
          },
          content: formData.content,
        }),
      });

      if (response.status === 429) {
        alert('Rate limit exceeded. Please wait before creating another motion.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create motion');
      }

      // Download the DOCX file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motion-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating motion:', error);
      alert(error.message || 'Failed to create motion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Create Motion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Document Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Document Type
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  required
                >
                  <option value="motion">Motion</option>
                  <option value="declaration">Meet-and-Confer Declaration</option>
                  <option value="sanctions">Sanctions Block</option>
                  <option value="certificate">Certificate of Service</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  required
                >
                  <option value="IL">Illinois</option>
                  <option value="NY">New York</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Court Name
                </label>
                <input
                  type="text"
                  value={formData.courtName}
                  onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  required
                  placeholder="Superior Court of California, County of Los Angeles"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Case Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  placeholder="Case No. 123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Plaintiff
                  </label>
                  <input
                    type="text"
                    value={formData.plaintiff}
                    onChange={(e) => setFormData({ ...formData, plaintiff: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Defendant
                  </label>
                  <input
                    type="text"
                    value={formData.defendant}
                    onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Motion Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  required
                  placeholder="Enter the motion content here..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? 'Generating...' : 'Generate Motion'}
          </button>
        </form>
      </div>
    </div>
  );
}

