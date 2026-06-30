import { clsx } from 'clsx';

interface Props {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'green' | 'gray' | 'orange';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': variant === 'blue',
          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200': variant === 'red',
          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200': variant === 'green',
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300': variant === 'gray',
          'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200': variant === 'orange',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
