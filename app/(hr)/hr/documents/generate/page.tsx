'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function GenerateDocumentPage() {
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: emp } = await supabase
      .from('employees')
      .select('*, hr_roles(permissions)')
      .eq('user_id', user.id)
      .single();
    setCurrentEmployee(emp);
    // Fetch all employees (for HR/Manager)
    if (emp?.hr_roles?.permissions?.hr) {
      const { data: allEmployees } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name')
        .eq('employment_status', 'Active')
        .order('first_name');
      setEmployees(allEmployees || []);
    } else {
      // Non-HR users can only generate for themselves
      setEmployees([emp]);
      setSelectedEmployee(emp.id);
    }
    // Fetch document templates
    const { data: docTemplates } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setTemplates(docTemplates || []);
  };
  const handleGenerate = async () => {
    if (!selectedEmployee || !selectedTemplate) {
      setError('Please select both employee and document template');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Fetch employee details
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          *,
          departments(name),
          hr_roles(name)
        `)
        .eq('id', selectedEmployee)
        .single();
      // Fetch template
      const { data: template } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', selectedTemplate)
        .single();
      if (!employee || !template) {
        throw new Error('Employee or template not found');
      }
      // Generate document content by replacing placeholders
      let documentContent = template.template_content;
      // Replace variables with actual data
      const variables: Record<string, string> = {
        '{{employee_name}}': `${employee.first_name} ${employee.last_name}`,
        '{{employee_id}}': employee.employee_id,
        '{{designation}}': employee.designation || 'N/A',
        '{{department}}': employee.departments?.name || 'N/A',
        '{{hire_date}}': new Date(employee.hire_date).toLocaleDateString(),
        '{{email}}': employee.email,
        '{{phone}}': employee.phone || 'N/A',
        '{{current_date}}': new Date().toLocaleDateString(),
        '{{company_name}}': 'IntimeSolutions',
      };
      Object.entries(variables).forEach(([key, value]) => {
        documentContent = documentContent.replace(new RegExp(key, 'g'), value);
      });
      // Generate document number
      const docNumber = `DOC${Date.now()}`;
      // Save generated document
      const { data: savedDoc, error: saveError } = await supabase
        .from('generated_documents')
        .insert({
          template_id: template.id,
          employee_id: selectedEmployee,
          document_number: docNumber,
          document_type: template.type,
          generated_content: documentContent,
          data: variables,
          created_by: currentEmployee.id,
        })
        .select()
        .single();
      if (saveError) throw saveError;
      setGeneratedDocument(savedDoc);
      setSuccess(true);
    } catch (err) {
      setError('Failed to generate document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadPDF = () => {
    // In a real implementation, this would generate a proper PDF
    // For now, we'll just download the HTML content
    if (!generatedDocument) return;
    const blob = new Blob([generatedDocument.generated_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDocument.document_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handlePreview = () => {
    if (!generatedDocument) return;
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(generatedDocument.generated_content);
      previewWindow.document.close();
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Document</h1>
        <p className="text-gray-600 mt-1">Create official HR documents from templates</p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && generatedDocument && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Document generated successfully! Document #: {generatedDocument.document_number}
          </AlertDescription>
        </Alert>
      )}
      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>Select the employee and document template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Employee *</Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
              disabled={!currentEmployee?.hr_roles?.permissions?.hr}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Document Template *</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a document template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedEmployee || !selectedTemplate}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Document'}
          </Button>
        </CardContent>
      </Card>
      {/* Generated Document Actions */}
      {generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle>Document Generated</CardTitle>
            <CardDescription>
              Document #{generatedDocument.document_number} created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Document
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <div className="border-t pt-4">
              <Button
                onClick={() => {
                  setGeneratedDocument(null);
                  setSelectedTemplate('');
                  setSuccess(false);
                }}
                variant="outline"
                className="w-full"
              >
                Generate Another Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>Document templates you can generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {template.type}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {template.variables?.length || 0} variables
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
