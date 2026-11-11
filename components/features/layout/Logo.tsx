export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect x="1" y="1" width="22" height="22" rx="6" className="fill-primary" />
    <path
      d="M12 5.5l5.2 3v7l-5.2 3-5.2-3v-7l5.2-3z"
      className="stroke-primary-foreground"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M12 5.5v13M6.8 8.5l5.2 3 5.2-3"
      className="stroke-primary-foreground"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);
