import React, { useMemo, useState } from 'react';

export const ApprovalModal = React.memo(function ApprovalModal({
  open,
  mode,
  labels,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const title = useMemo(
    () => (mode === 'reject' ? labels.rejectTitle : labels.approveTitle),
    [labels, mode]
  );

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      reason: reason.trim(),
      comments: comments.trim(),
      remarks: [reason.trim(), comments.trim()].filter(Boolean).join(' - '),
    });
    setReason('');
    setComments('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-3">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{labels.subtitle}</p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold text-slate-500">
            {mode === 'reject' ? labels.rejectionReason : labels.approvalRemarks}
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={mode === 'reject' ? labels.reasonPlaceholder : labels.approvePlaceholder}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold text-slate-500">{labels.comments}</span>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder={labels.commentPlaceholder}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-600 outline-none resize-none"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${
              mode === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {mode === 'reject' ? labels.reject : labels.approve}
          </button>
        </div>
      </div>
    </div>
  );
});
