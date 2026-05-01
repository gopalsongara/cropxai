import React from 'react';

export const CropSkeleton = React.memo(function CropSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 space-y-6 animate-pulse">
      <div className="h-72 md:h-80 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
});

