import { getInitials } from '@/utils';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, color = '#19b383', size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

interface AvatarGroupProps {
  members: { name: string; color?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ members, max = 4, size = 'sm' }: AvatarGroupProps) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <div key={i} className="ring-2 ring-white dark:ring-gray-900 rounded-full">
          <Avatar name={m.name} color={m.color} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div className={`${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-semibold ring-2 ring-white dark:ring-gray-900`}>
          +{extra}
        </div>
      )}
    </div>
  );
}
