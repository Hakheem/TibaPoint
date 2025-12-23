"use client";

import { useState, useEffect } from 'react';
export default function AuthLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Brand/Info Section */}
      <div className="relative bg-linear-to-br from-blue-100 to-blue-50 dark:from-gray-900 dark:to-teal-950 p-8 md:p-12">
        <div className="h-full flex flex-col justify-center mx-auto max-w-lg">
          {/* Hero Text */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Your Healthcare, <span className="text-linear-primary"> <br/>
                Simplified
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Book appointments, consult doctors, and manage your health journey, all in one place.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-linear-primary flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Instant Appointments
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Book with verified doctors in minutes, 24/7 availability.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-linear-primary flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Secure & Private
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  HIPAA-compliant platform ensuring your health data stays private.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-linear-primary flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Digital Health Records
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access prescriptions, test results, and medical history anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Verified Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-linear-to-br from-blue-100 to-blue-50 dark:from-gray-900 dark:to-teal-950">
        <div className="w-full max-w-md mx-auto my-auto">
          {mounted && children}
        </div>
      </main>
    </div>
  );
}

