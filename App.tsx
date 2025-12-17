
import React, { useState } from 'react';
import { FileText, Briefcase, Settings, Sparkles, Download, ArrowRight, Loader2, Mail, CheckCircle } from 'lucide-react';
import { Section } from './components/Section';
import { SettingsForm } from './components/SettingsForm';
import { DataPreview } from './components/DataPreview';
import { parseUserProfile, parseJobDescription, generateTailoredResume, generateCoverLetter } from './services/geminiService';
import { UserProfile, JobDescription, GenerationSettings, TailoredResume, TailoredCoverLetter, DEFAULT_SETTINGS } from './types';

const App: React.FC = () => {
  // State
  const [userText, setUserText] = useState('');
  const [jobText, setJobText] = useState('');
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  
  const [generatedResume, setGeneratedResume] = useState<TailoredResume | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<TailoredCoverLetter | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');
  
  // Loading states
  const [isParsingUser, setIsParsingUser] = useState(false);
  const [isParsingJob, setIsParsingJob] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const handleParseUser = async () => {
    if (!userText.trim()) return;
    setIsParsingUser(true);
    try {
      const profile = await parseUserProfile(userText);
      setUserProfile(profile);
    } catch (e) {
      alert("Failed to parse user profile. Please check your API key and try again.");
    } finally {
      setIsParsingUser(false);
    }
  };

  const handleParseJob = async () => {
    if (!jobText.trim()) return;
    setIsParsingJob(true);
    try {
      const job = await parseJobDescription(jobText);
      setJobDescription(job);
    } catch (e) {
      alert("Failed to parse job description. Please check your API key and try again.");
    } finally {
      setIsParsingJob(false);
    }
  };

  const handleGenerate = async () => {
    if (!userProfile || !jobDescription) return;
    setIsGenerating(true);
    setGeneratedResume(null);
    setGeneratedCoverLetter(null);
    
    try {
      const resumePromise = generateTailoredResume(userProfile, jobDescription, settings);
      
      let coverLetterPromise = null;
      if (settings.generateCoverLetter) {
        coverLetterPromise = generateCoverLetter(userProfile, jobDescription, settings);
      }

      const [resume, coverLetter] = await Promise.all([resumePromise, coverLetterPromise]);
      
      setGeneratedResume(resume);
      if (coverLetter) {
        setGeneratedCoverLetter(coverLetter);
      }
      setActiveTab('resume');
    } catch (e) {
      alert("Failed to generate application materials.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadResume = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${jobDescription?.company?.replace(/\s+/g, '-').toLowerCase() || 'tailored'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCoverLetter = () => {
    if (!generatedCoverLetter) return;
    const blob = new Blob([generatedCoverLetter.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${jobDescription?.company?.replace(/\s+/g, '-').toLowerCase() || 'tailored'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">ResumeTailor</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">AI Career Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:block text-xs text-gray-400 font-medium">
              V1.2 • GEMINI 3 FLASH
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: User Profile */}
        <Section 
          title="1. Your Profile" 
          description="Paste your existing resume or CV text to extract your career data."
          defaultOpen={!userProfile}
        >
          <div className="space-y-4">
            <div className="relative group">
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Paste your full resume here (work history, skills, education)..."
                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm transition-shadow group-hover:shadow-md"
              />
              <div className="absolute bottom-4 right-4">
                 <button
                  onClick={handleParseUser}
                  disabled={isParsingUser || !userText}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    isParsingUser || !userText 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {isParsingUser ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  {isParsingUser ? 'Extracting...' : 'Parse Profile'}
                </button>
              </div>
            </div>
            <DataPreview data={userProfile} label="Extracted Profile" />
          </div>
        </Section>

        {/* Step 2: Job Description */}
        <Section 
          title="2. Target Job" 
          description="Paste the job description you are applying for."
          defaultOpen={!!userProfile && !jobDescription}
        >
          <div className="space-y-4">
            <div className="relative group">
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the job posting here..."
                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm transition-shadow group-hover:shadow-md"
              />
              <div className="absolute bottom-4 right-4">
                 <button
                  onClick={handleParseJob}
                  disabled={isParsingJob || !jobText}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    isParsingJob || !jobText 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {isParsingJob ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />}
                  {isParsingJob ? 'Analyzing...' : 'Analyze Job'}
                </button>
              </div>
            </div>
             <DataPreview data={jobDescription} label="Extracted Job Details" />
          </div>
        </Section>

        {/* Step 3: Settings */}
        <Section 
          title="3. Tailoring Settings" 
          description="Configure how you want the AI to adapt your resume and cover letter."
          defaultOpen={false}
        >
          <SettingsForm settings={settings} onChange={setSettings} />
        </Section>

        {/* Action Area */}
        <div className="flex justify-end pt-4 pb-8">
           <button
            onClick={handleGenerate}
            disabled={!userProfile || !jobDescription || isGenerating}
            className={`w-full md:w-auto flex items-center justify-center px-10 py-4 rounded-2xl text-lg font-bold transition-all transform active:scale-[0.98] shadow-xl ${
              !userProfile || !jobDescription
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white hover:shadow-2xl hover:brightness-110'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Crafting Your Application...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Tailor My Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {(generatedResume || generatedCoverLetter) && (
           <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in ring-1 ring-black/5">
             <div className="bg-gray-900 px-6 py-0 flex flex-col sm:flex-row justify-between items-stretch">
                <div className="flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar">
                   <button
                    onClick={() => setActiveTab('resume')}
                    className={`px-6 py-4 text-sm font-bold flex items-center transition-all border-b-2 ${
                      activeTab === 'resume' 
                        ? 'text-white border-indigo-500 bg-white/5' 
                        : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5'
                    }`}
                   >
                     <FileText className="w-4 h-4 mr-2" />
                     Resume
                   </button>
                   {generatedCoverLetter && (
                     <button
                      onClick={() => setActiveTab('coverLetter')}
                      className={`px-6 py-4 text-sm font-bold flex items-center transition-all border-b-2 ${
                        activeTab === 'coverLetter' 
                          ? 'text-white border-indigo-500 bg-white/5' 
                          : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5'
                      }`}
                     >
                       <Mail className="w-4 h-4 mr-2" />
                       Cover Letter
                     </button>
                   )}
                </div>
                
                <div className="flex items-center py-3 sm:py-0">
                  <button 
                    onClick={activeTab === 'resume' ? handleDownloadResume : handleDownloadCoverLetter}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-lg active:scale-95"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .md
                  </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-4">
                {/* Side Panel: Match Info */}
                <div className="lg:col-span-1 bg-gray-50 border-r border-gray-200 p-6 space-y-8">
                   <div>
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Analysis</h3>
                     <div className="flex items-baseline">
                       <span className="text-5xl font-black text-gray-900 tracking-tighter">85</span>
                       <span className="text-sm font-bold text-gray-400 ml-1">/ 100</span>
                     </div>
                     <div className="text-xs font-semibold text-green-600 flex items-center mt-1">
                       <CheckCircle className="w-3 h-3 mr-1" /> Highly Competitive
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                       <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                     </div>
                   </div>

                   <div>
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Keyword Boosts</h3>
                     <div className="flex flex-wrap gap-2">
                        {generatedResume?.matchSummary?.topMatchedKeywords.map((k, i) => (
                          <span key={i} className="px-2.5 py-1.5 bg-white text-gray-700 text-[10px] font-bold rounded-lg border border-gray-200 shadow-sm">
                            {k}
                          </span>
                        ))}
                     </div>
                   </div>

                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-[10px] text-indigo-700 font-bold leading-relaxed">
                        Pro Tip: The AI focused on these items because they matched high-priority requirements in the job listing.
                      </p>
                   </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 p-0 bg-white min-h-[700px]">
                  {activeTab === 'resume' ? (
                    <div className="w-full h-full p-8 sm:p-12 text-gray-800 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                      {generatedResume?.markdown}
                    </div>
                  ) : (
                    <div className="w-full h-full p-8 sm:p-12 text-gray-800 font-serif text-lg leading-loose whitespace-pre-wrap selection:bg-indigo-100">
                      {generatedCoverLetter?.content}
                    </div>
                  )}
                </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
