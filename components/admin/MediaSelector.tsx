'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MediaLibrary from '@/components/admin/media/MediaLibrary';
import { createClient } from '@/lib/supabase/client';

interface MediaAsset {
  id: string;
  file_url: string;
  filename: string;
  mime_type: string;
  original_filename?: string;
}

interface MediaSelectorProps {
  onSelect: (media: MediaAsset) => void;
  onClose: () => void;
  filterType?: 'images' | 'videos' | 'all';
}

export default function MediaSelector({ onSelect, onClose, filterType = 'images' }: MediaSelectorProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by type if specified
      if (filterType === 'images') {
        query = query.ilike('mime_type', 'image/%');
      } else if (filterType === 'videos') {
        query = query.ilike('mime_type', 'video/%');
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const handleSelect = (asset: any) => {
    onSelect({
      id: asset.id,
      file_url: asset.file_url,
      filename: asset.original_filename || asset.filename,
      mime_type: asset.mime_type
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <MediaLibrary 
            initialAssets={assets} 
            onSelect={handleSelect}
            selectionMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
