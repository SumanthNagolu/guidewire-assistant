-- HR Document Templates
-- Insert default document templates for the HR system

-- Employment Confirmation Letter
INSERT INTO document_templates (name, code, type, template_content, variables) VALUES (
  'Employment Confirmation Letter',
  'EMP_CONF',
  'Letter',
  '<!DOCTYPE html>
<html>
<head>
    <title>Employment Confirmation Letter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
        .letterhead { text-align: center; margin-bottom: 40px; }
        .letterhead h1 { color: #4F46E5; margin: 0; }
        .date { text-align: right; margin-bottom: 30px; }
        .content { margin: 30px 0; }
        .signature { margin-top: 60px; }
    </style>
</head>
<body>
    <div class="letterhead">
        <h1>{{company_name}}</h1>
        <p>Human Resources Department</p>
    </div>
    
    <div class="date">
        Date: {{current_date}}
    </div>
    
    <h2>EMPLOYMENT CONFIRMATION LETTER</h2>
    
    <div class="content">
        <p>To Whom It May Concern,</p>
        
        <p>This letter is to confirm that <strong>{{employee_name}}</strong> (Employee ID: <strong>{{employee_id}}</strong>) is currently employed with {{company_name}} as a <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
        
        <p>{{employee_name}} joined our organization on <strong>{{hire_date}}</strong> and continues to be in good standing with the company.</p>
        
        <p>This letter is being provided at the employee''s request for official purposes.</p>
        
        <p>If you require any additional information, please feel free to contact our HR department at hr@intimesolutions.com.</p>
    </div>
    
    <div class="signature">
        <p>Sincerely,</p>
        <p><strong>Human Resources Department</strong><br>
        {{company_name}}</p>
    </div>
</body>
</html>',
  '["employee_name", "employee_id", "designation", "department", "hire_date", "current_date", "company_name"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Experience Certificate
INSERT INTO document_templates (name, code, type, template_content, variables) VALUES (
  'Experience Certificate',
  'EXP_CERT',
  'Certificate',
  '<!DOCTYPE html>
<html>
<head>
    <title>Experience Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; padding: 40px; }
        .certificate { border: 3px solid #4F46E5; padding: 40px; }
        .letterhead { text-align: center; margin-bottom: 40px; }
        .letterhead h1 { color: #4F46E5; margin: 0; font-size: 32px; }
        .title { text-align: center; font-size: 24px; font-weight: bold; margin: 30px 0; text-decoration: underline; }
        .content { margin: 30px 0; text-align: justify; }
        .signature { margin-top: 80px; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="letterhead">
            <h1>{{company_name}}</h1>
            <p>Human Resources Department</p>
        </div>
        
        <div class="title">EXPERIENCE CERTIFICATE</div>
        
        <div class="content">
            <p>This is to certify that <strong>{{employee_name}}</strong> was employed with <strong>{{company_name}}</strong> from <strong>{{hire_date}}</strong> to <strong>{{current_date}}</strong>.</p>
            
            <p>During their tenure with us, {{employee_name}} worked as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
            
            <p>We found {{employee_name}} to be hardworking, sincere, and dedicated to their responsibilities. Their contribution to the organization has been valuable.</p>
            
            <p>We wish {{employee_name}} all the best in their future endeavors.</p>
        </div>
        
        <div class="signature">
            <p><strong>Authorized Signatory</strong><br>
            Human Resources Department<br>
            {{company_name}}</p>
            <p>Date: {{current_date}}</p>
        </div>
    </div>
</body>
</html>',
  '["employee_name", "employee_id", "designation", "department", "hire_date", "current_date", "company_name"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Salary Certificate
INSERT INTO document_templates (name, code, type, template_content, variables) VALUES (
  'Salary Certificate',
  'SAL_CERT',
  'Certificate',
  '<!DOCTYPE html>
<html>
<head>
    <title>Salary Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
        .letterhead { text-align: center; margin-bottom: 40px; }
        .letterhead h1 { color: #4F46E5; margin: 0; }
        .date { text-align: right; margin-bottom: 30px; }
        .content { margin: 30px 0; }
        .signature { margin-top: 60px; }
        .confidential { color: red; font-weight: bold; text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="confidential">CONFIDENTIAL</div>
    
    <div class="letterhead">
        <h1>{{company_name}}</h1>
        <p>Human Resources Department</p>
    </div>
    
    <div class="date">
        Date: {{current_date}}
    </div>
    
    <h2>SALARY CERTIFICATE</h2>
    
    <div class="content">
        <p>To Whom It May Concern,</p>
        
        <p>This is to certify that <strong>{{employee_name}}</strong> (Employee ID: <strong>{{employee_id}}</strong>) is employed with {{company_name}} as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
        
        <p>{{employee_name}} joined our organization on <strong>{{hire_date}}</strong>.</p>
        
        <p>This certificate is issued upon the employee''s request for bank/financial purposes.</p>
        
        <p><em>Note: This document is confidential and is intended solely for the purpose stated above.</em></p>
    </div>
    
    <div class="signature">
        <p>Sincerely,</p>
        <p><strong>Human Resources Department</strong><br>
        {{company_name}}</p>
    </div>
</body>
</html>',
  '["employee_name", "employee_id", "designation", "department", "hire_date", "current_date", "company_name"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Offer Letter
INSERT INTO document_templates (name, code, type, template_content, variables) VALUES (
  'Offer Letter',
  'OFFER_LTR',
  'Letter',
  '<!DOCTYPE html>
<html>
<head>
    <title>Offer Letter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
        .letterhead { text-align: center; margin-bottom: 40px; }
        .letterhead h1 { color: #4F46E5; margin: 0; }
        .date { text-align: right; margin-bottom: 30px; }
        .content { margin: 30px 0; }
        .signature { margin-top: 60px; }
        .terms { background: #f3f4f6; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="letterhead">
        <h1>{{company_name}}</h1>
        <p>Human Resources Department</p>
    </div>
    
    <div class="date">
        Date: {{current_date}}
    </div>
    
    <p>Dear {{employee_name}},</p>
    
    <h2>OFFER OF EMPLOYMENT</h2>
    
    <div class="content">
        <p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at {{company_name}}.</p>
        
        <p>Your employment with the company will commence on <strong>{{hire_date}}</strong>.</p>
        
        <div class="terms">
            <h3>Terms and Conditions:</h3>
            <ul>
                <li>Position: {{designation}}</li>
                <li>Department: {{department}}</li>
                <li>Start Date: {{hire_date}}</li>
                <li>Employment Type: Full-time</li>
            </ul>
        </div>
        
        <p>Please confirm your acceptance of this offer by signing and returning a copy of this letter.</p>
        
        <p>We look forward to welcoming you to our team!</p>
    </div>
    
    <div class="signature">
        <p>Sincerely,</p>
        <p><strong>Human Resources Department</strong><br>
        {{company_name}}</p>
        
        <div style="margin-top: 80px;">
            <p>Accepted by: ___________________________</p>
            <p>Signature: ___________________________</p>
            <p>Date: ___________________________</p>
        </div>
    </div>
</body>
</html>',
  '["employee_name", "designation", "department", "hire_date", "current_date", "company_name"]'::jsonb
) ON CONFLICT (code) DO NOTHING;


