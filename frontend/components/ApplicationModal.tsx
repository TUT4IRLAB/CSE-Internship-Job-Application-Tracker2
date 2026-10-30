'use client';

import { useState } from 'react';
import { fetchWithAuth } from '../services/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionType: 'CREATE' | 'DELETE';
  applicationId?: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  actionType,
  applicationId,
}: ModalProps) {
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (actionType === 'CREATE') {
        await fetchWithAuth('/applications', {
          method: 'POST',
          adminPassword: password,
          body: JSON.stringify({ company, role }),
        });
      } else if (actionType === 'DELETE' && applicationId) {
        await fetchWithAuth(`/applications/${applicationId}`, {
          method: 'DELETE',
          adminPassword: password,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-black">
        <h2 className="text-xl font-bold mb-4">
          {actionType === 'CREATE' ? 'Add Application' : 'Confirm Delete'}
        </h2>

        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {actionType === 'CREATE' && (
            <>
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Job Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Admin Master Password Required
            </label>
            <input
              type="password"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}