import LoginForm from "@/components/LoginForm";
import React, { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
