'use client';

import { useState } from 'react';
import { Monitor, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ScreenshotGalleryProps {
  screenshots: any[];
  analyses?: any[];
  userId: string;
  compact?: boolean;
  fullView?: boolean;
}

export default function ScreenshotGallery({ 
  screenshots, 
  analyses, 
  userId,
  compact = false, 
  fullView = false 
}: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<Map<string, string>>(new Map());
  const supabase = createClient();
  
  // Get screenshot URL with signed URL
  async function getScreenshotUrl(screenshotUrl: string): Promise<string | null> {
    if (screenshotUrls.has(screenshotUrl)) {
      return screenshotUrls.get(screenshotUrl)!;
    }
    
    try {
      const { data } = await supabase.storage
        .from('productivity-screenshots')
        .createSignedUrl(screenshotUrl, 3600); // 1 hour expiry
      
      if (data?.signedUrl) {
        setScreenshotUrls(new Map(screenshotUrls.set(screenshotUrl, data.signedUrl)));
        return data.signedUrl;
      }
    } catch (error) {
          }
    
    return null;
  }
  
  // Get analysis for screenshot
  function getAnalysis(screenshot: any) {
    return analyses?.find(a => a.screenshot_id === screenshot.id);
  }
  
  function openModal(index: number) {
    setSelectedIndex(index);
  }
  
  function closeModal() {
    setSelectedIndex(null);
  }
  
  function nextScreenshot() {
    if (selectedIndex !== null && screenshots && selectedIndex < screenshots.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }
  
  function prevScreenshot() {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }
  
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="text-center py-8">
        <Monitor className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No screenshots captured yet</p>
        <p className="text-gray-400 text-xs mt-1">Screenshots will appear here once the desktop agent is running</p>
      </div>
    );
  }
  
  const displayCount = compact ? 4 : screenshots.length;
  
  return (
    <>
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'} gap-3`}>
        {screenshots.slice(0, displayCount).map((screenshot, index) => {
          const analysis = getAnalysis(screenshot);
          
          return (
            <div key={screenshot.id} className="group relative cursor-pointer" onClick={() => openModal(index)}>
              <ScreenshotThumbnail screenshot={screenshot} getUrl={getScreenshotUrl} />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-2">
                  <p className="text-xs font-semibold truncate">
                    {analysis?.application_detected || 'Unknown App'}
                  </p>
                  <p className="text-xs mt-1">
                    {new Date(screenshot.captured_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Productivity Score Badge */}
              {analysis?.productivity_score && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {analysis.productivity_score}%
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-6xl p-0">
          {selectedIndex !== null && screenshots[selectedIndex] && (
            <div className="relative">
              {/* Hidden title for accessibility */}
              <div className="sr-only">Screenshot Viewer</div>
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Navigation Buttons */}
              {selectedIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevScreenshot(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {selectedIndex < screenshots.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextScreenshot(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              
              {/* Screenshot Image */}
              <ScreenshotImage screenshot={screenshots[selectedIndex]} getUrl={getScreenshotUrl} />
              
              {/* AI Analysis Overlay */}
              {getAnalysis(screenshots[selectedIndex]) && (
                <div className="bg-white p-4 border-t">
                  <AnalysisDetails analysis={getAnalysis(screenshots[selectedIndex])} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScreenshotThumbnail({ screenshot, getUrl }: { screenshot: any; getUrl: (url: string) => Promise<string | null> }) {
  const [url, setUrl] = useState<string | null>(null);
  
  useState(() => {
    getUrl(screenshot.screenshot_url).then(setUrl);
  });
  
  return (
    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {url ? (
        <img 
          src={url} 
          alt="Screenshot" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Monitor className="w-8 h-8 text-gray-300" />
        </div>
      )}
    </div>
  );
}

function ScreenshotImage({ screenshot, getUrl }: { screenshot: any; getUrl: (url: string) => Promise<string | null> }) {
  const [url, setUrl] = useState<string | null>(null);
  
  useState(() => {
    getUrl(screenshot.screenshot_url).then(setUrl);
  });
  
  return (
    <div className="bg-black">
      {url ? (
        <img 
          src={url} 
          alt="Screenshot" 
          className="w-full max-h-[80vh] object-contain"
        />
      ) : (
        <div className="w-full h-96 flex items-center justify-center">
          <Monitor className="w-16 h-16 text-gray-400" />
        </div>
      )}
    </div>
  );
}

function AnalysisDetails({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{analysis.application_detected}</h3>
          {analysis.window_title && (
            <p className="text-sm text-gray-600">{analysis.window_title}</p>
          )}
        </div>
        <div className="flex gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-600">Productivity</p>
            <p className="text-lg font-bold text-blue-600">{analysis.productivity_score}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Focus</p>
            <p className="text-lg font-bold text-purple-600">{analysis.focus_score}%</p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700">{analysis.activity_description}</p>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
          {analysis.work_category?.replace('_', ' ')}
        </span>
        {analysis.project_context && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Project: {analysis.project_context}
          </span>
        )}
        {analysis.client_context && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Client: {analysis.client_context}
          </span>
        )}
      </div>
      
      {analysis.detected_entities && analysis.detected_entities.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-1">Detected:</p>
          <div className="flex flex-wrap gap-1">
            {analysis.detected_entities.map((entity: string, index: number) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {entity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

