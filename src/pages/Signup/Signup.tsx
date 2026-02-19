import { SignupForm } from "../../components/SignupForm";

export function Signup() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="mt-2 text-gray-600">Join with your details below.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
