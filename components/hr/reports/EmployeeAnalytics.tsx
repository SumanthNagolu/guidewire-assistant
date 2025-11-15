'use client';

import { Employee, Department } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EmployeeAnalyticsProps {
  employees: Employee[];
  departments: any[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function EmployeeAnalytics({ employees, departments }: EmployeeAnalyticsProps) {
  // Department distribution
  const departmentData = departments.map((dept) => ({
    name: dept.name,
    value: employees.filter(e => e.department_id === dept.id).length,
  })).filter(d => d.value > 0);

  // Employment type distribution
  const employmentTypeData = [
    { name: 'Full-time', value: employees.filter(e => e.employment_type === 'Full-time').length },
    { name: 'Part-time', value: employees.filter(e => e.employment_type === 'Part-time').length },
    { name: 'Contract', value: employees.filter(e => e.employment_type === 'Contract').length },
    { name: 'Intern', value: employees.filter(e => e.employment_type === 'Intern').length },
  ].filter(d => d.value > 0);

  // Tenure analysis (years of service)
  const currentYear = new Date().getFullYear();
  const tenureData = [
    { range: '0-1 years', count: 0 },
    { range: '1-3 years', count: 0 },
    { range: '3-5 years', count: 0 },
    { range: '5+ years', count: 0 },
  ];

  employees.forEach(emp => {
    const tenure = currentYear - new Date(emp.hire_date).getFullYear();
    if (tenure < 1) tenureData[0].count++;
    else if (tenure < 3) tenureData[1].count++;
    else if (tenure < 5) tenureData[2].count++;
    else tenureData[3].count++;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employment Type */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {employmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tenure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Tenure Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Average Tenure</div>
            <div className="text-2xl font-bold">
              {(employees.reduce((sum, emp) => {
                const tenure = currentYear - new Date(emp.hire_date).getFullYear();
                return sum + tenure;
              }, 0) / employees.length).toFixed(1)} years
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">New Hires (This Year)</div>
            <div className="text-2xl font-bold">
              {employees.filter(e => 
                new Date(e.hire_date).getFullYear() === currentYear
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Largest Department</div>
            <div className="text-2xl font-bold">
              {departmentData.length > 0 
                ? departmentData.reduce((max, dept) => dept.value > max.value ? dept : max).name
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


