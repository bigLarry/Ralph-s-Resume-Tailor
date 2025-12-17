
import React from 'react';
import { GenerationSettings } from '../types';

interface SettingsFormProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
  const handleTextChange = (field: keyof GenerationSettings, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  const handleNumberChange = (field: keyof GenerationSettings, value: number) => {
    onChange({ ...settings, [field]: value });
  };

  const handleCheckboxChange = (field: keyof GenerationSettings, checked: boolean) => {
    onChange({ ...settings, [field]: checked });
  };

  const handleSectionToggle = (section: string) => {
    const newSections = settings.includeSections.includes(section)
      ? settings.includeSections.filter(s => s !== section)
      : [...settings.includeSections, section];
    onChange({ ...settings, includeSections: newSections });
  };

  const allSections = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'interests'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Length</label>
          <select
            value={settings.targetLength}
            onChange={(e) => handleTextChange('targetLength', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
          >
            <option value="1-page">1 Page</option>
            <option value="2-page">2 Pages</option>
            <option value="unrestricted">Unrestricted</option>
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
          <select
            value={settings.tone}
            onChange={(e) => handleTextChange('tone', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
          >
            <option value="neutral">Neutral (Standard)</option>
            <option value="concise">Concise & Direct</option>
            <option value="technical">Technical & Detailed</option>
            <option value="storytelling">Storytelling</option>
          </select>
        </div>

        {/* Counts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience Items</label>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.experienceMaxItems}
            onChange={(e) => handleNumberChange('experienceMaxItems', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Project Items</label>
          <input
            type="number"
            min={0}
            max={10}
            value={settings.projectsMaxItems}
            onChange={(e) => handleNumberChange('projectsMaxItems', parseInt(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
          />
        </div>
      </div>

      {/* Sections */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sections to Include</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allSections.map(section => (
            <div key={section} className="flex items-center">
              <input
                id={`section-${section}`}
                type="checkbox"
                checked={settings.includeSections.includes(section)}
                onChange={() => handleSectionToggle(section)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`section-${section}`} className="ml-2 block text-sm text-gray-900 capitalize">
                {section}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center">
          <input
            id="showComments"
            type="checkbox"
            checked={settings.showKeywordMatchComments}
            onChange={(e) => handleCheckboxChange('showKeywordMatchComments', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="showComments" className="ml-2 block text-sm text-gray-900">
            Include detailed matching notes in the generated Markdown (as HTML comments)
          </label>
        </div>

        <div className="flex items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <input
            id="genCoverLetter"
            type="checkbox"
            checked={settings.generateCoverLetter}
            onChange={(e) => handleCheckboxChange('generateCoverLetter', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <label htmlFor="genCoverLetter" className="block text-sm font-semibold text-indigo-900">
              Generate Tailored Cover Letter
            </label>
            <p className="text-xs text-indigo-600">Creates a persuasive cover letter alongside your resume.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
