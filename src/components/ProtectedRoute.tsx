import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

type ProtectedRouteProps = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setAuthorized(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuthorized(response.ok);
      } catch (error) {
        setAuthorized(false);
      }
    };

    verify();
  }, []);

  if (authorized === null) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-slate-400">Checking access…</div>;
  }

  if (!authorized) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
