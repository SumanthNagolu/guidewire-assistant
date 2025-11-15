import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { createClient } from '@/lib/supabase/server';
import { loggers } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import { aiOrchestrator } from '@/lib/ai/orchestrator';

// Document types
export interface DocumentMetadata {
  id?: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  category?: string;
  tags?: string[];
  extractedText?: string;
  aiAnalysis?: any;
}

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: Certification[];
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  graduationDate?: string;
  gpa?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
}

// Document Service
export class DocumentService {
  private static instance: DocumentService;

  private constructor() {}

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  // Upload document
  async uploadDocument(
    file: File | Buffer,
    filename: string,
    userId: string,
    category?: string
  ): Promise<DocumentMetadata> {
    const supabase = await createClient();

    try {
      // Generate unique filename
      const uniqueFilename = `${Date.now()}_${filename}`;
      const path = `documents/${userId}/${uniqueFilename}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file);

      if (uploadError) throw uploadError;

      // Extract text based on file type
      let extractedText = '';
      const mimeType = this.getMimeType(filename);

      if (mimeType === 'application/pdf') {
        extractedText = await this.extractPdfText(file);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await this.extractDocxText(file);
      } else if (mimeType.startsWith('text/')) {
        extractedText = file.toString();
      }

      // Store metadata
      const metadata: DocumentMetadata = {
        filename,
        mimeType,
        size: file instanceof Buffer ? file.length : file.size,
        uploadedBy: userId,
        uploadedAt: new Date(),
        category,
        extractedText,
      };

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          filename,
          path,
          mime_type: mimeType,
          size: metadata.size,
          uploaded_by: userId,
          category,
          extracted_text: extractedText,
        })
        .select()
        .single();

      if (docError) throw docError;

      metadata.id = docData.id;

      // Process document based on category
      if (category === 'resume') {
        await this.processResume(docData.id, extractedText);
      }

      // Emit event
      await eventBus.emit('document:uploaded', {
        documentId: docData.id,
        userId,
        filename,
        category,
      });

      loggers.system.info('Document uploaded', {
        documentId: docData.id,
        filename,
        userId,
      });

      return metadata;

    } catch (error) {
      loggers.system.error('Document upload failed', error);
      throw error;
    }
  }

  // Extract PDF text
  private async extractPdfText(file: File | Buffer): Promise<string> {
    try {
      const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      loggers.system.error('PDF extraction failed', error);
      return '';
    }
  }

  // Extract DOCX text
  private async extractDocxText(file: File | Buffer): Promise<string> {
    try {
      const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      loggers.system.error('DOCX extraction failed', error);
      return '';
    }
  }

  // Process resume
  async processResume(documentId: string, text: string): Promise<ResumeData> {
    try {
      // Use AI to parse resume
      const response = await aiOrchestrator.route({
        prompt: `Parse this resume and extract structured data:
        
${text}

Return JSON with:
- name
- email  
- phone
- location
- summary
- experience (array of {company, title, startDate, endDate, description, technologies})
- education (array of {institution, degree, field, graduationDate, gpa})
- skills (array of strings)
- certifications (array of {name, issuer, date, expiryDate})
- linkedinUrl
- githubUrl`,
        context: {
          useCase: 'recruiter',
          userId: 'system',
        },
        temperature: 0.3,
      });

      // Parse AI response
      let resumeData: ResumeData;
      try {
        resumeData = JSON.parse(response.content);
      } catch {
        // Fallback to basic extraction
        resumeData = this.basicResumeExtraction(text);
      }

      // Store parsed resume data
      const supabase = await createClient();
      await supabase
        .from('parsed_resumes')
        .insert({
          document_id: documentId,
          parsed_data: resumeData,
        });

      // Emit event
      await eventBus.emit('resume:parsed', {
        documentId,
        resumeData,
      });

      return resumeData;

    } catch (error) {
      loggers.system.error('Resume processing failed', error);
      return this.basicResumeExtraction(text);
    }
  }

  // Basic resume extraction (fallback)
  private basicResumeExtraction(text: string): ResumeData {
    const lines = text.split('\n');
    const resumeData: ResumeData = {
      experience: [],
      education: [],
      skills: [],
    };

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) resumeData.email = emailMatch[0];

    // Extract phone
    const phoneMatch = text.match(/[\d\s()+-]+/);
    if (phoneMatch && phoneMatch[0].length > 9) {
      resumeData.phone = phoneMatch[0].trim();
    }

    // Extract skills (common keywords)
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 
      'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes'
    ];
    
    resumeData.skills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );

    return resumeData;
  }

  // Generate document from template
  async generateFromTemplate(
    templateId: string,
    data: Record<string, any>,
    userId: string
  ): Promise<DocumentMetadata> {
    const supabase = await createClient();

    try {
      // Get template
      const { data: template } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) throw new Error('Template not found');

      // Replace variables in template
      let content = template.content;
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, String(value));
      });

      // Convert to PDF (in production would use proper PDF generation)
      const pdfBuffer = Buffer.from(content); // Simplified

      // Upload generated document
      return await this.uploadDocument(
        pdfBuffer,
        `${template.name}_${Date.now()}.pdf`,
        userId,
        'generated'
      );

    } catch (error) {
      loggers.system.error('Document generation failed', error);
      throw error;
    }
  }

  // Search documents
  async searchDocuments(
    query: string,
    filters?: {
      userId?: string;
      category?: string;
      dateRange?: { from: Date; to: Date };
    }
  ): Promise<DocumentMetadata[]> {
    const supabase = await createClient();

    let dbQuery = supabase
      .from('documents')
      .select('*')
      .textSearch('extracted_text', query);

    if (filters?.userId) {
      dbQuery = dbQuery.eq('uploaded_by', filters.userId);
    }

    if (filters?.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }

    if (filters?.dateRange) {
      dbQuery = dbQuery
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString());
    }

    const { data } = await dbQuery;

    return data?.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      mimeType: doc.mime_type,
      size: doc.size,
      uploadedBy: doc.uploaded_by,
      uploadedAt: new Date(doc.created_at),
      category: doc.category,
      extractedText: doc.extracted_text,
    })) || [];
  }

  // Get document
  async getDocument(documentId: string): Promise<DocumentMetadata | null> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      filename: data.filename,
      mimeType: data.mime_type,
      size: data.size,
      uploadedBy: data.uploaded_by,
      uploadedAt: new Date(data.created_at),
      category: data.category,
      extractedText: data.extracted_text,
    };
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    const supabase = await createClient();

    // Get document info
    const { data: doc } = await supabase
      .from('documents')
      .select('path')
      .eq('id', documentId)
      .single();

    if (doc) {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([doc.path]);

      // Delete metadata
      await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      // Emit event
      await eventBus.emit('document:deleted', {
        documentId,
      });
    }
  }

  // Get MIME type from filename
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

// Export singleton
export const documentService = DocumentService.getInstance();
