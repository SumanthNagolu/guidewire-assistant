import EmployeeBot from '@/components/productivity/EmployeeBot';
export default function EmployeeBotPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Employee Bot</h1>
        <p className="text-gray-600 mt-1">
          Your personal productivity assistant - Daily standup, coaching, project management & more
        </p>
      </div>
      <EmployeeBot />
    </div>
  );
}
