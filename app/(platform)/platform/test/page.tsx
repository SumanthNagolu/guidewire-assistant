export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Platform Test Page</h1>
      <p className="text-gray-600">
        If you can see this page, the platform routing is working correctly!
      </p>
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800 font-semibold">✅ Platform authentication is working</p>
        <p className="text-green-700 mt-2">You have successfully accessed the Trikala platform.</p>
      </div>
    </div>
  );
}
