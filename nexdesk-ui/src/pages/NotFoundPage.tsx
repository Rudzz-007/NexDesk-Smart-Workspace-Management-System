import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="container-nd py-24 text-center">
      <p className="text-8xl font-bold text-[#e2e8f0] mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Page not found</h1>
      <p className="text-[#64748b] mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/"><Button leftIcon={<Home size={16} />}>Back to Home</Button></Link>
        <Link to="/browse"><Button variant="secondary" leftIcon={<Search size={16} />}>Browse Desks</Button></Link>
      </div>
    </div>
  );
}
