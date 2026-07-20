import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { socialLinks } from '../config/social';

type SocialIconsProps = {
  className?: string;
  linkClassName?: string;
  includeCopyLink?: boolean;
};

const SocialIcons = ({ className = '', linkClassName = '', includeCopyLink = false }: SocialIconsProps) => {
  const [copied, setCopied] = useState(false);
  const defaultLinkClassName =
    'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-300 hover:scale-110 hover:border-blue-400/50 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer';

  const handleCopy = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`.trim()}>
      {socialLinks.map(({ href, icon: Icon, ariaLabel, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className={`${defaultLinkClassName} ${linkClassName}`.trim()}
        >
          <Icon size={18} className="transition duration-300" />
        </a>
      ))}
      {includeCopyLink ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy article link"
          className={`${defaultLinkClassName} ${linkClassName}`.trim()}
        >
          {copied ? <Check size={18} className="text-cyan-300" /> : <Copy size={18} />}
        </button>
      ) : null}
    </div>
  );
};

export default SocialIcons;
