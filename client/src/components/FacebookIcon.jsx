export default function FacebookIcon({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        d="M13.5 21.5v-7.5h2.4l.4-3h-2.8V9c0-.8.3-1.3 1.4-1.3h1.4V5c-.2 0-1-.1-1.9-.1-2.2 0-3.7 1.3-3.7 3.8v2.3H8v3h2.7v7.5h2.8z"
        fill="#fff"
      />
    </svg>
  );
}
