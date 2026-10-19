import React from 'react';
import { 
  AlertTriangle, Clock, CheckCircle2, RefreshCw, Eye, ShieldAlert,
  ArrowUpRight, AlertCircle, ShieldCheck, Minus
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().trim();
  const isSm = size === 'sm';

  let config = {
    label: status || 'Pending',
    bg: 'bg-neutral-100',
    text: 'text-neutral-800',
    border: 'border-neutral-300',
    dot: 'bg-neutral-500',
    icon: Clock
  };

  if (norm === 'new') {
    config = {
      label: 'New Grievance',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
      icon: Clock
    };
  } else if (norm === 'assigned') {
    config = {
      label: 'Officer Assigned',
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-200',
      dot: 'bg-[#008C95]',
      icon: ArrowUpRight
    };
  } else if (norm === 'accepted') {
    config = {
      label: 'Accepted by Dept',
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-300',
      dot: 'bg-teal-700',
      icon: CheckCircle2
    };
  } else if (norm === 'in progress' || norm === 'in_progress') {
    config = {
      label: 'Work in Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      border: 'border-amber-300',
      dot: 'bg-[#D9A441]',
      icon: RefreshCw
    };
  } else if (norm === 'citizen verification' || norm === 'citizen_verification' || norm === 'resolved') {
    config = {
      label: 'Citizen Verification',
      bg: 'bg-emerald-50',
      text: 'text-emerald-950',
      border: 'border-emerald-300',
      dot: 'bg-[#3A7D44]',
      icon: Eye
    };
  } else if (norm === 'closed') {
    config = {
      label: 'Verified & Closed',
      bg: 'bg-neutral-100',
      text: 'text-neutral-800',
      border: 'border-neutral-300',
      dot: 'bg-neutral-600',
      icon: ShieldCheck
    };
  } else if (norm === 'reopened') {
    config = {
      label: 'Reopened by Citizen',
      bg: 'bg-rose-50',
      text: 'text-rose-950',
      border: 'border-rose-300',
      dot: 'bg-[#C0392B]',
      icon: AlertCircle
    };
  }

  const Icon = config.icon;

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-md border
        ${config.bg} ${config.text} ${config.border}
        ${isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true"></span>
      <span className="font-semibold">{config.label}</span>
    </span>
  );
}

interface PriorityBadgeProps {
  priority?: string;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority = 'Medium', size = 'md' }: PriorityBadgeProps) {
  const norm = (priority || '').toLowerCase();
  const isSm = size === 'sm';

  if (norm === 'critical') {
    return (
      <span 
        className={`
          inline-flex items-center gap-1 font-bold rounded-md bg-[#F7E9E9] text-[#8E2C2C] border border-[#8E2C2C]/30
          ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        `}
      >
        <ShieldAlert className="w-3 h-3 shrink-0 text-[#8E2C2C]" />
        <span>CRITICAL</span>
      </span>
    );
  }

  if (norm === 'high') {
    return (
      <span 
        className={`
          inline-flex items-center gap-1 font-semibold rounded-md bg-[#FDF6E8] text-[#D99A2B] border border-[#D99A2B]/30
          ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        `}
      >
        <AlertTriangle className="w-3 h-3 shrink-0 text-[#D99A2B]" />
        <span>High Priority</span>
      </span>
    );
  }

  if (norm === 'low') {
    return (
      <span 
        className={`
          inline-flex items-center gap-1 font-medium rounded-md bg-[#EBF4ED] text-[#3A7D44] border border-[#3A7D44]/30
          ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        `}
      >
        <Minus className="w-3 h-3 shrink-0 text-[#3A7D44]" />
        <span>Low Priority</span>
      </span>
    );
  }

  // Default Medium
  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded-md bg-[#E6F6F7] text-[#006D75] border border-[#008C95]/30
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
      `}
    >
      <Clock className="w-3 h-3 shrink-0 text-[#008C95]" />
      <span>Medium Priority</span>
    </span>
  );
}

interface SLABadgeProps {
  deadline?: number;
  status?: string;
  size?: 'sm' | 'md';
}

export function SLABadge({ deadline, status, size = 'md' }: SLABadgeProps) {
  const isSm = size === 'sm';
  const isClosed = status === 'Closed' || status === 'Citizen Verification';

  if (!deadline) {
    return (
      <span className="text-gray-400 font-mono text-xs">Standard SLA</span>
    );
  }

  const now = Date.now();
  const diffHours = (deadline - now) / 3600000;

  if (isClosed) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Resolved in SLA</span>
      </span>
    );
  }

  if (diffHours < 0) {
    const overdueHours = Math.abs(Math.round(diffHours));
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-[#8E2C2C] bg-[#F7E9E9] border border-[#8E2C2C]/30 rounded ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
        <AlertTriangle className="w-3 h-3 text-[#8E2C2C]" />
        <span>OVERDUE ({overdueHours}h)</span>
      </span>
    );
  }

  if (diffHours <= 24) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold text-[#D99A2B] bg-[#FDF6E8] border border-[#D99A2B]/40 rounded ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
        <Clock className="w-3 h-3 text-[#D99A2B]" />
        <span>AT RISK ({Math.round(diffHours)}h left)</span>
      </span>
    );
  }

  const daysLeft = Math.round(diffHours / 24);
  return (
    <span className={`inline-flex items-center gap-1 font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
      <span>ON TRACK ({daysLeft > 1 ? `${daysLeft} days` : `${Math.round(diffHours)}h`})</span>
    </span>
  );
}
