import React from 'react';
import { Check, X } from 'lucide-react';

interface DataPreviewProps {
  data: any;
  label: string;
  emptyMessage?: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, label, emptyMessage = "No data extracted yet" }) => {
  if (!data) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  // Helper to render key details
  const renderSummary = () => {
    // User Profile specific preview
    if ('fullName' in data) {
      return (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-gray-600">Name:</span> {data.fullName}</div>
          <div><span className="font-semibold text-gray-600">Skills Found:</span> {data.skills?.length || 0}</div>
          <div><span className="font-semibold text-gray-600">Experience Entries:</span> {data.experience?.length || 0}</div>
          <div><span className="font-semibold text-gray-600">Education Entries:</span> {data.education?.length || 0}</div>
        </div>
      );
    }
    
    // Job Description specific preview
    if ('title' in data) {
       return (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2"><span className="font-semibold text-gray-600">Role:</span> {data.title} at {data.company}</div>
          <div className="col-span-2"><span className="font-semibold text-gray-600">Keywords found:</span> {data.keywords?.length || 0}</div>
           <div className="col-span-2 flex flex-wrap gap-1 mt-1">
             {data.keywords?.slice(0, 8).map((k: string, i: number) => (
               <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{k}</span>
             ))}
             {data.keywords?.length > 8 && <span className="text-xs text-gray-500 self-center">+{data.keywords.length - 8} more</span>}
           </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs text-green-600 flex items-center font-medium">
          <Check className="w-3 h-3 mr-1" />
          Extracted Successfully
        </span>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
        {renderSummary()}
        <details className="mt-3">
            <summary className="text-xs text-indigo-600 cursor-pointer hover:underline">View raw JSON data</summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 bg-white p-2 rounded border border-indigo-100">
                {JSON.stringify(data, null, 2)}
            </pre>
        </details>
      </div>
    </div>
  );
};