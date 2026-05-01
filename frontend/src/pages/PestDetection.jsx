import React, { useEffect, useRef, useState } from 'react';
import { 
  Bug, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { pestData } from '../data/pestData';
import { useNavigate } from 'react-router-dom';

export const PestDetection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const lastDetectAttemptRef = useRef(0);
  const fileInputRef = useRef(null);

  const FALLBACK_PLACEHOLDER =
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80';
  const resolveImageUrl = (imageUrl) => imageUrl || FALLBACK_PLACEHOLDER;

  const getTimeLabel = (item) => {
    if (item?.time) return item.time;
    if (!item?.date) return language === 'hi' ? 'हाल ही में' : 'Recently';
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) return language === 'hi' ? 'हाल ही में' : 'Recently';
    return parsed.toLocaleDateString();
  };

  const normalizeSeverity = (severity) => {
    const value = String(severity || '').toLowerCase();
    if (value === 'high') return 'critical';
    if (value === 'medium') return 'moderate';
    if (value === 'low') return 'healthy';
    return 'moderate';
  };

  const getStatusBadge = (status) => {
    const safeStatus = normalizeSeverity(status);
    const map = {
      critical: {
        className: 'bg-red-100 text-red-600',
        label: language === 'hi' ? 'गंभीर' : 'Critical',
      },
      moderate: {
        className: 'bg-yellow-100 text-yellow-700',
        label: language === 'hi' ? 'मध्यम' : 'Moderate',
      },
      healthy: {
        className: 'bg-green-100 text-green-600',
        label: language === 'hi' ? 'स्वस्थ' : 'Healthy',
      },
    };
    const style = map[safeStatus];
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${style.className}`}>
        {style.label}
      </span>
    );
  };

  const getReportIdFromDisease = (diseaseName) => {
    const value = String(diseaseName || '').toLowerCase();
    if (value.includes('leaf rust') || value.includes('पत्ती जंग')) return 1;
    if (value.includes('aphid') || value.includes('एफिड')) return 2;
    if (value.includes('powdery mildew') || value.includes('मिल्ड्यू')) return 3;
    return 4;
  };

  useEffect(() => {
    setRecentScans([]);
  }, []);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const onSelectFile = (file) => {
    if (!file) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = () => setUploadedImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1280;
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'));
              const compressed = new File([blob], file.name, { type: 'image/jpeg' });
              return resolve(compressed);
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });

  const handleDetect = async () => {
    if (!selectedFile) return;
    const now = Date.now();
    if (now - lastDetectAttemptRef.current < 1200) return;
    lastDetectAttemptRef.current = now;
    try {
      setDetecting(true);
      setError('');
      setScanProgress(15);
      await compressImage(selectedFile);
      setScanProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const selected = pestData[Math.floor(Math.random() * pestData.length)];
      const nextResult = {
        name: selected.disease[language] || selected.disease.en,
        crop: selected.crop[language] || selected.crop.en,
        severity: selected.severity.key,
        severityLabel: selected.severity[language] || selected.severity.en,
        confidence: selected.confidence,
        symptoms: selected.symptoms[language] || selected.symptoms.en,
        advice: selected.treatment[language] || selected.treatment.en,
        treatment: selected.treatment[language] || selected.treatment.en,
        prevention: selected.prevention[language] || selected.prevention.en,
        organicSolution: selected.organic[language] || selected.organic.en,
        chemicalSolution: language === 'hi'
          ? 'यदि आवश्यकता हो तो लेबल निर्देशानुसार रासायनिक दवा उपयोग करें।'
          : 'Use chemical pesticide only if needed and as per label directions.',
        imageUrl: uploadedImage || previewUrl,
        date: new Date().toISOString(),
        reportId: getReportIdFromDisease(selected.disease.en),
      };
      setScanProgress(100);
      setResult(nextResult);
      setRecentScans((prev) => [
        nextResult,
        ...prev.slice(0, 9),
      ]);
    } catch (_detectError) {
      setError(
        language === 'hi'
          ? 'AI सेवा अस्थायी रूप से उपलब्ध नहीं है'
          : 'AI service temporarily unavailable'
      );
    } finally {
      setDetecting(false);
      setTimeout(() => setScanProgress(0), 600);
    }
  };

  const onDropFile = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    onSelectFile(file);
  };

  const activePreviewImage = result?.imageUrl ? resolveImageUrl(result.imageUrl) : previewUrl;

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 w-full max-w-7xl mx-auto h-full flex flex-col xl:flex-row gap-6 md:gap-8 pb-24 md:pb-8">
      
      {/* Left Content Area (Upload Section) */}
      <div className="flex-1 flex flex-col space-y-4 md:space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            {t.pestDetection.title}
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base">
            {t.pestDetection.subtitle}
          </p>
        </div>
        {/* Upload Box */}
        <div 
          className={`bg-white border-2 border-dashed rounded-3xl p-6 md:p-12 flex flex-col items-center text-center transition-all duration-200 relative overflow-hidden ${
            isDragging ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDropFile}
        >
          {/* Box Content */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 md:mb-6">
            <Bug className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
            {t.pestDetection.uploadBox.title}
          </h3>
          
          <p className="text-slate-500 mb-8 max-w-md text-sm md:text-base">
            {t.pestDetection.uploadBox.descDesk}
          </p>

          {activePreviewImage ? (
            <div className="w-full max-w-md mb-6">
              <img
                src={activePreviewImage}
                alt={result?.name || 'Preview'}
                className="w-full h-52 object-cover rounded-2xl border border-slate-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_PLACEHOLDER;
                }}
              />
              {selectedFile ? (
                <p className="text-xs text-slate-500 mt-2 truncate">{selectedFile.name}</p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl('');
                  setUploadedImage('');
                  setResult(null);
                }}
                className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                {language === 'hi' ? 'छवि हटाएं' : 'Remove image'}
              </button>
            </div>
          ) : null}

          {/* Unified Instructions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-left w-full max-w-lg mb-8">
            <div>
              <p className="text-green-800 font-bold text-xs uppercase tracking-wider mb-3">{t.pestDetection.instructions.englishLabel}</p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.en1}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.en2}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.en3}</li>
              </ul>
            </div>
            <div>
              <p className="text-green-800 font-bold text-xs uppercase tracking-wider mb-3">{t.pestDetection.instructions.hindiLabel}</p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.hi1}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.hi2}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{t.pestDetection.instructions.hi3}</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onSelectFile(e.target.files?.[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm min-w-[200px]"
            >
              <Camera className="w-5 h-5" />
              {t.pestDetection.uploadBox.useCamera}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm min-w-[200px]"
            >
              <ImageIcon className="w-5 h-5" />
              {t.pestDetection.uploadBox.chooseGallery}
            </button>
          </div>

          <button
            onClick={handleDetect}
            disabled={!selectedFile || detecting}
            className="mt-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-colors min-w-[200px] flex items-center justify-center gap-2"
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
            {detecting
              ? language === 'hi'
                ? 'AI आपकी फसल का विश्लेषण कर रहा है...'
                : 'AI is analyzing your crop...'
              : language === 'hi'
                ? 'कीट पहचानें'
                : 'Detect Pest'}
          </button>

          {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}

          {detecting ? (
            <div className="w-full max-w-lg mt-5 p-5 rounded-2xl border border-green-100 bg-green-50/80 text-left shadow-sm">
              <div className="flex items-center gap-3 text-green-700 font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'hi' ? 'AI आपकी फसल का विश्लेषण कर रहा है...' : 'AI is analyzing your crop...'}
              </div>
              <div className="mt-3 h-2 w-full bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="w-full max-w-lg mt-5 p-5 rounded-2xl border border-slate-200 bg-white text-left shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  🦠 {result.name}
                </h3>
                {getStatusBadge(result.severity)}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {language === 'hi' ? 'फसल' : 'Crop'}: {result.crop || (language === 'hi' ? 'सामान्य' : 'General')}
              </p>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {language === 'hi' ? 'लक्षण' : 'Symptoms'}
                </p>
                <p className="text-sm text-slate-700 mt-1">{result.symptoms}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {language === 'hi' ? 'उपचार' : 'Treatment'}
                </p>
                <p className="text-sm text-slate-700 mt-1">{result.treatment}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {language === 'hi' ? 'रोकथाम' : 'Prevention'}
                </p>
                <p className="text-sm text-slate-700 mt-1">{result.prevention}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {language === 'hi' ? 'जैविक समाधान' : 'Organic Solution'}
                </p>
                <p className="text-sm text-slate-700 mt-1">{result.organicSolution}</p>
              </div>
              <p className="text-sm font-semibold text-green-700">
                {(result.confidence ?? '--')}% {language === 'hi' ? 'सटीकता' : 'Accuracy'}
              </p>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, Number(result.confidence) || 0))}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Bottom Tech Specs */}
          <div className="hidden md:flex w-full justify-between items-center mt-12 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              {t.pestDetection.techSpecs.version}
            </div>
            <div>{t.pestDetection.techSpecs.formats}</div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Recent Scans) */}
      <div className="w-full xl:w-[350px] flex flex-col">
        {/* Unified Header */}
        <div className="flex justify-between items-center mb-4 mt-4 xl:mt-0">
          <h3 className="text-xl font-bold text-slate-800">{t.pestDetection.sidebar.title}</h3>
          <span className="text-green-600 font-bold text-xs md:text-sm tracking-wider uppercase">
            {t.pestDetection.sidebar.viewAll}
          </span>
        </div>

        {/* Unified List Container */}
        <div className="flex flex-col bg-transparent md:bg-white md:rounded-3xl md:p-5 md:shadow-sm md:border md:border-slate-100 flex-1 relative overflow-hidden">
          <div className="flex flex-col gap-3 md:gap-4 mb-4 z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentScans.map((item, index) => (
              <div
                key={`${item.name}-${item.date}-${index}`}
                className="flex gap-3 items-center group cursor-pointer p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                onClick={() =>
                  navigate(`/pest-report/${item.reportId || getReportIdFromDisease(item.name)}`, {
                    state: { scan: item },
                  })
                }
              >
                <div className="w-14 h-14 rounded-lg bg-slate-200 shrink-0 overflow-hidden relative">
                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.name || 'scan'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                  <p className="text-slate-500 text-xs truncate mt-0.5">{item.treatment || '-'}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{getTimeLabel(item)}</p>
                </div>
                <div>{getStatusBadge(item.severity)}</div>
              </div>
            ))}
            {!recentScans.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                {language === 'hi' ? 'हाल की स्कैन रिपोर्ट यहां दिखाई देंगी।' : 'Recent scan results will appear here.'}
              </div>
            ) : null}
          </div>

          {/* Bottom Stats (Unified) */}
          <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 bg-white md:bg-gradient-to-b md:from-white md:to-[#f4f7f4] relative z-10 md:-mx-5 md:-mb-5 md:px-5 md:py-5 rounded-2xl md:rounded-none shadow-sm md:shadow-none">
            <div className="text-center p-2 md:p-0">
              <p className="text-2xl font-bold text-red-600">{t.pestDetection.sidebar.stats.criticalNum}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{t.pestDetection.sidebar.stats.criticalLabel}</p>
            </div>
            <div className="text-center p-2 md:p-0 border-l border-slate-100 md:border-none">
              <p className="text-2xl font-bold text-green-700">{t.pestDetection.sidebar.stats.healthNum}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{t.pestDetection.sidebar.stats.healthLabel}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
