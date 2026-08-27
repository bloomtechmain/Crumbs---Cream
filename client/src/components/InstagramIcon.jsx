import { useId } from 'react';

export default function InstagramIcon({ size = 24, className = '' }) {
  const gradientId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E4405F" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#5851DB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
    </svg>
  );
}
