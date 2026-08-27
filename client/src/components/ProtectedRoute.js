import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Bot, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace({
        pathname: '/login',
        query: { redirect: router.asPath },
      });
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center text-slate-300">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Bot className="w-8 h-8 text-indigo-400" />
          </div>
          <Loader2 className="w-20 h-20 text-indigo-500 animate-spin absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-white tracking-wide">Agentflow_AI</p>
          <p className="text-xs text-slate-400 font-mono">Verifying secure operator session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
