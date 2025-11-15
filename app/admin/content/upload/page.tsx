'use client'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, Video, FileQuestion, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
export default function ContentUploadPage() {
  const { toast } = useToast()
  const [selectedTopic, setSelectedTopic] = useState('')
  const [contentType, setContentType] = useState<'presentation' | 'video' | 'quiz'>('presentation')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transformationOptions, setTransformationOptions] = useState({
    enhanceWithAI: true,
    splitIntoBlocks: true,
    generateTranscript: true,
    extractKeyframes: true,
    addChapters: true,
  })
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  const handleUpload = async () => {
    if (!file || !selectedTopic) {
      toast({
        title: 'Missing information',
        description: 'Please select a topic and file to upload',
        variant: 'destructive',
      })
      return
    }
    setIsUploading(true)
    setUploadProgress(0)
    try {
      // Step 1: Upload file
      setUploadProgress(20)
      const formData = new FormData()
      formData.append('file', file)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }
      const { filePath } = await uploadResponse.json()
      setUploadProgress(50)
      // Step 2: Transform content
      const transformResponse = await fetch('/api/content/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contentType,
          filePath,
          topicId: selectedTopic,
          options: transformationOptions,
        }),
      })
      if (!transformResponse.ok) {
        throw new Error('Content transformation failed')
      }
      const result = await transformResponse.json()
      setUploadProgress(100)
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Content has been transformed and added to the topic',
        })
        // Reset form
        setFile(null)
        setSelectedTopic('')
      } else {
        throw new Error(result.error || 'Transformation failed')
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'presentation':
        return '.ppt,.pptx,.pdf'
      case 'video':
        return '.mp4,.mov,.avi,.webm'
      case 'quiz':
        return '.json,.csv,.xlsx'
      default:
        return '*'
    }
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Upload</h1>
        <p className="text-gray-600 mt-2">
          Transform legacy content into modern learning materials
        </p>
      </div>
      <div className="grid gap-6">
        {/* Content Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Content Type</CardTitle>
            <CardDescription>
              Select the type of content you want to upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={contentType === 'presentation' ? 'default' : 'outline'}
                className="h-24 flex-col gap-2"
                onClick={() => setContentType('presentation')}
              >
                <FileText className="h-8 w-8" />
                Presentation
              </Button>
              <Button
                variant={contentType === 'video' ? 'default' : 'outline'}
                className="h-24 flex-col gap-2"
                onClick={() => setContentType('video')}
              >
                <Video className="h-8 w-8" />
                Video
              </Button>
              <Button
                variant={contentType === 'quiz' ? 'default' : 'outline'}
                className="h-24 flex-col gap-2"
                onClick={() => setContentType('quiz')}
              >
                <FileQuestion className="h-8 w-8" />
                Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Topic Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Target Topic</CardTitle>
            <CardDescription>
              Select the topic where this content will be added
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic-1">Topic 1: Introduction to ClaimCenter</SelectItem>
                  <SelectItem value="topic-2">Topic 2: Business Rules</SelectItem>
                  <SelectItem value="topic-3">Topic 3: Workflow Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {/* Transformation Options */}
        <Card>
          <CardHeader>
            <CardTitle>Transformation Options</CardTitle>
            <CardDescription>
              Configure how the content should be processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentType === 'presentation' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enhanceWithAI"
                    checked={transformationOptions.enhanceWithAI}
                    onCheckedChange={(checked) => 
                      setTransformationOptions(prev => ({ ...prev, enhanceWithAI: checked as boolean }))
                    }
                  />
                  <Label htmlFor="enhanceWithAI">
                    Enhance with AI (add summaries, key points, interview tips)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="splitIntoBlocks"
                    checked={transformationOptions.splitIntoBlocks}
                    onCheckedChange={(checked) => 
                      setTransformationOptions(prev => ({ ...prev, splitIntoBlocks: checked as boolean }))
                    }
                  />
                  <Label htmlFor="splitIntoBlocks">
                    Split into learning blocks (theory, demo, practice)
                  </Label>
                </div>
              </>
            )}
            {contentType === 'video' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateTranscript"
                    checked={transformationOptions.generateTranscript}
                    onCheckedChange={(checked) => 
                      setTransformationOptions(prev => ({ ...prev, generateTranscript: checked as boolean }))
                    }
                  />
                  <Label htmlFor="generateTranscript">
                    Generate transcript
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="extractKeyframes"
                    checked={transformationOptions.extractKeyframes}
                    onCheckedChange={(checked) => 
                      setTransformationOptions(prev => ({ ...prev, extractKeyframes: checked as boolean }))
                    }
                  />
                  <Label htmlFor="extractKeyframes">
                    Extract keyframes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addChapters"
                    checked={transformationOptions.addChapters}
                    onCheckedChange={(checked) => 
                      setTransformationOptions(prev => ({ ...prev, addChapters: checked as boolean }))
                    }
                  />
                  <Label htmlFor="addChapters">
                    Auto-generate chapters
                  </Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select the file you want to transform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Input
                  type="file"
                  accept={getAcceptedFileTypes()}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </Label>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-gray-600 text-center">
                    {uploadProgress < 50 ? 'Uploading file...' : 'Transforming content...'}
                  </p>
                </div>
              )}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Large files may take several minutes to process. The transformation
                  will continue in the background if needed.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleUpload}
                disabled={!file || !selectedTopic || isUploading}
                className="w-full"
              >
                {isUploading ? 'Processing...' : 'Upload and Transform'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
