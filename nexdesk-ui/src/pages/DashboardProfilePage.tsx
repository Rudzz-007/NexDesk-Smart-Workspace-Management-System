import { User, Mail, Shield, Sparkles, Building2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

export default function DashboardProfilePage() {
  const { user } = useAuth();

  const userEmail = user?.email || 'user@nexdesk.com';
  const userRole = user?.role || 'employee';
  const userName = userEmail.split('@')[0];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Profile Settings</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Manage your NexDesk account identity and workspace access credentials.
        </p>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center text-xl font-bold uppercase shadow-inner">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] capitalize">{userName}</h2>
                <Badge variant={userRole === 'admin' ? 'pending' : 'available'} dot>
                  {userRole === 'admin' ? 'Admin Profile' : 'Verified Employee'}
                </Badge>
              </div>
              <p className="text-sm text-[#64748b] mt-0.5">{userEmail}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7]">
            Active Member
          </span>
        </div>

        {/* Read-only profile details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5 flex items-center gap-1.5">
              <Mail size={14} className="text-[#94a3b8]" />
              Work Email Address
            </label>
            <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm font-medium text-[#0f172a] select-all">
              {userEmail}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5 flex items-center gap-1.5">
              <Shield size={14} className="text-[#94a3b8]" />
              Assigned System Role
            </label>
            <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm font-medium text-[#0f172a] capitalize">
              {userRole}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#94a3b8]" />
              Primary Workspace Hub
            </label>
            <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm text-[#475569]">
              All India Enterprise Access (50+ Cities)
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5 flex items-center gap-1.5">
              <Clock size={14} className="text-[#94a3b8]" />
              Check-in SLA Status
            </label>
            <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm text-[#475569]">
              Instant QR Gate Pass Enabled
            </div>
          </div>
        </div>
      </div>

      {/* Notice about editing coming soon per requirements */}
      <div className="rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0 text-[#3b82f6]">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Profile editing coming soon</h3>
            <p className="text-sm text-[#64748b] mt-1 leading-relaxed">
              Self-service name and password update endpoints will be available in the upcoming NexDesk v2 release. For immediate role modifications or enterprise email updates, please contact your organization's workspace administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
