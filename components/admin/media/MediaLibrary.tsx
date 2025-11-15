'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  Download,
  Trash2,
  Edit2,
  Copy,
  X,
  Check,
  MoreVertical,
  FolderPlus,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface MediaAsset {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  folder_path: string;
  tags: string[];
  usage_count: number;
  last_used_at: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface MediaLibraryProps {
  initialAssets: MediaAsset[];
  onSelect?: (asset: MediaAsset) => void;
  selectionMode?: boolean;
}

export default function MediaLibrary({ 
  initialAssets, 
  onSelect,
  selectionMode = false 
}: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('/');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Get unique folders
  const folders = useMemo(() => {
    const folderSet = new Set<string>(['/']);
    assets.forEach(asset => {
      const parts = asset.folder_path.split('/').filter(Boolean);
      let path = '/';
      parts.forEach(part => {
        path += part + '/';
        folderSet.add(path);
      });
    });
    return Array.from(folderSet).sort();
  }, [assets]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFolder = 
        folderFilter === '/' || asset.folder_path.startsWith(folderFilter);
      
      const matchesType = 
        typeFilter === 'all' || 
        (typeFilter === 'images' && asset.mime_type.startsWith('image/')) ||
        (typeFilter === 'videos' && asset.mime_type.startsWith('video/')) ||
        (typeFilter === 'documents' && asset.mime_type.includes('pdf'));

      return matchesSearch && matchesFolder && matchesType;
    });
  }, [assets, searchTerm, folderFilter, typeFilter]);

  // Sort assets
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.original_filename.localeCompare(b.original_filename);
        case 'size':
          return b.file_size - a.file_size;
        case 'type':
          return a.mime_type.localeCompare(b.mime_type);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [filteredAssets, sortBy]);

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`${file.name} exceeds 10MB limit`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const folder = folderFilter === '/' ? 'general' : folderFilter.replace(/^\/|\/$/g, '');
        const filename = `${folder}/${timestamp}-${index}.${extension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(data.path);

        // Create thumbnail URL for images
        let thumbnailUrl = null;
        if (file.type.startsWith('image/')) {
          thumbnailUrl = publicUrl; // In production, use image processing service
        }

        // Save to database
        const { data: mediaAsset, error: dbError } = await supabase
          .from('media_assets')
          .insert({
            filename: data.path,
            original_filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            file_url: publicUrl,
            thumbnail_url: thumbnailUrl,
            folder_path: folderFilter
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update progress
        setUploadProgress((prev) => prev + (100 / fileArray.length));

        return mediaAsset;
      });

      const uploadedAssets = await Promise.all(uploadPromises);
      setAssets(prev => [...uploadedAssets, ...prev]);
      toast.success(`Successfully uploaded ${uploadedAssets.length} file(s)`);
      setShowUploadDialog(false);
    } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [folderFilter, supabase]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  // Handle asset deletion
  const handleDelete = async (assetIds: string[]) => {
    if (!confirm(`Delete ${assetIds.length} file(s)? This cannot be undone.`)) {
      return;
    }

    try {
      // Delete from storage and database
      await Promise.all(assetIds.map(async (id) => {
        const asset = assets.find(a => a.id === id);
        if (!asset) return;

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([asset.filename]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
        
        // Delete from database
        const { error: dbError } = await supabase
          .from('media_assets')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;
      }));

      setAssets(prev => prev.filter(a => !assetIds.includes(a.id)));
      setSelectedAssets(new Set());
      toast.success(`Deleted ${assetIds.length} file(s)`);
    } catch (error) {
            toast.error('Failed to delete some files');
    }
  };

  // Handle asset update
  const handleUpdate = async () => {
    if (!editingAsset) return;

    try {
      const { error } = await supabase
        .from('media_assets')
        .update({
          alt_text: editingAsset.alt_text,
          caption: editingAsset.caption,
          description: editingAsset.description,
          tags: editingAsset.tags
        })
        .eq('id', editingAsset.id);

      if (error) throw error;

      setAssets(prev => prev.map(a => 
        a.id === editingAsset.id ? editingAsset : a
      ));
      
      if (selectedAsset?.id === editingAsset.id) {
        setSelectedAsset(editingAsset);
      }
      
      setEditingAsset(null);
      toast.success('Asset updated successfully');
    } catch (error) {
            toast.error('Failed to update asset');
    }
  };

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    return FileText;
  };

  return (
    <div className="bg-white rounded-xl border">
      {/* Toolbar */}
      <div className="border-b p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, alt text, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <Select value={folderFilter} onValueChange={setFolderFilter}>
            <SelectTrigger className="w-[180px]">
              <Folder className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Folders" />
            </SelectTrigger>
            <SelectContent>
              {folders.map(folder => (
                <SelectItem key={folder} value={folder}>
                  {folder === '/' ? 'All Folders' : folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Upload Button */}
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Selection Actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedAssets.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssets(new Set())}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(Array.from(selectedAssets))}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        className={`p-4 min-h-[400px] ${dragActive ? 'bg-blue-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {sortedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media files found</h3>
            <p className="text-gray-500 mb-4">
              Upload your first file or adjust your filters
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              Upload Files
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedAssets.map((asset) => {
              const Icon = getFileIcon(asset.mime_type);
              const isSelected = selectedAssets.has(asset.id);

              return (
                <div
                  key={asset.id}
                  className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                  }`}
                  onClick={() => {
                    if (selectionMode && onSelect) {
                      onSelect(asset);
                    } else {
                      setSelectedAsset(asset);
                      setShowDetailsSheet(true);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  {asset.thumbnail_url ? (
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.alt_text || asset.original_filename}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">
                      {asset.original_filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(asset.file_size)}
                    </p>
                  </div>

                  {/* Selection Checkbox */}
                  <div
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssets(prev => {
                        const next = new Set(prev);
                        if (next.has(asset.id)) {
                          next.delete(asset.id);
                        } else {
                          next.add(asset.id);
                        }
                        return next;
                      });
                    }}
                  >
                    <div className={`w-5 h-5 rounded border-2 ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-white border-gray-300'
                    } flex items-center justify-center`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyUrl(asset.file_url)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(asset.file_url, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete([asset.id])}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-12 p-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.size === sortedAssets.length && sortedAssets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets(new Set(sortedAssets.map(a => a.id)));
                        } else {
                          setSelectedAssets(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-3 font-medium text-sm">Name</th>
                  <th className="text-left p-3 font-medium text-sm">Type</th>
                  <th className="text-left p-3 font-medium text-sm">Size</th>
                  <th className="text-left p-3 font-medium text-sm">Uploaded</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedAssets.map((asset) => {
                  const Icon = getFileIcon(asset.mime_type);
                  const isSelected = selectedAssets.has(asset.id);

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowDetailsSheet(true);
                      }}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedAssets(prev => {
                              const next = new Set(prev);
                              if (next.has(asset.id)) {
                                next.delete(asset.id);
                              } else {
                                next.add(asset.id);
                              }
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {asset.thumbnail_url ? (
                            <img
                              src={asset.thumbnail_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {asset.original_filename}
                            </p>
                            {asset.alt_text && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {asset.alt_text}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {asset.mime_type.split('/')[1].toUpperCase()}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatBytes(asset.file_size)}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyUrl(asset.file_url)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(asset.file_url, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete([asset.id])}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload images, videos, or documents to your media library
            </DialogDescription>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Maximum file size: 10MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Select Files
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-gray-600 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Sheet */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedAsset && (
            <>
              <SheetHeader>
                <SheetTitle>Media Details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Preview */}
                <div className="border rounded-lg overflow-hidden">
                  {selectedAsset.mime_type.startsWith('image/') ? (
                    <img
                      src={selectedAsset.file_url}
                      alt={selectedAsset.alt_text || selectedAsset.original_filename}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {React.createElement(getFileIcon(selectedAsset.mime_type), {
                        className: 'w-16 h-16 text-gray-400'
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(selectedAsset.file_url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedAsset.file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAsset(selectedAsset)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Filename:</dt>
                        <dd className="font-medium">{selectedAsset.original_filename}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Type:</dt>
                        <dd>{selectedAsset.mime_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Size:</dt>
                        <dd>{formatBytes(selectedAsset.file_size)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Uploaded:</dt>
                        <dd>{new Date(selectedAsset.created_at).toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>

                  {editingAsset?.id === selectedAsset.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="alt-text">Alt Text</Label>
                        <Input
                          id="alt-text"
                          value={editingAsset.alt_text || ''}
                          onChange={(e) => setEditingAsset({
                            ...editingAsset,
                            alt_text: e.target.value
                          })}
                          placeholder="Describe the image..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="caption">Caption</Label>
                        <Input
                          id="caption"
                          value={editingAsset.caption || ''}
                          onChange={(e) => setEditingAsset({
                            ...editingAsset,
                            caption: e.target.value
                          })}
                          placeholder="Add a caption..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editingAsset.description || ''}
                          onChange={(e) => setEditingAsset({
                            ...editingAsset,
                            description: e.target.value
                          })}
                          placeholder="Add a longer description..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate}>
                          Save Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAsset(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedAsset.alt_text && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Alt Text</h4>
                          <p className="text-sm text-gray-600">{selectedAsset.alt_text}</p>
                        </div>
                      )}
                      {selectedAsset.caption && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Caption</h4>
                          <p className="text-sm text-gray-600">{selectedAsset.caption}</p>
                        </div>
                      )}
                      {selectedAsset.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{selectedAsset.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">File URL</h4>
                    <div className="flex gap-2">
                      <Input
                        value={selectedAsset.file_url}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrl(selectedAsset.file_url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}


