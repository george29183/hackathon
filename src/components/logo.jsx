export default function Logo({ className = "h-50 w-50" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Light Mode Logo */}
      <img 
        src="/pace-logo-dark.svg" 
        alt="Pace Logo" 
        className="w-full h-full block dark:hidden" 
      />
      {/* Dark Mode Logo */}
      <img 
        src="/pace-logo-white.svg" 
        alt="Pace Logo" 
        className="w-full h-full hidden dark:block" 
      />
    </div>
  );
}