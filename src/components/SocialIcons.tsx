import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { socialLinks } from '../config/social';

type SocialIconsProps = {
  className?: string;
  linkClassName?: string;
  includeCopyLink?: boolean;
  includeShareButton?: boolean;
  shareTitle?: string;
  shareText?: string;
  shareUrl?: string;
};

const SocialIcons = ({
  className = '',
  linkClassName = '',
  includeCopyLink = false,
  includeShareButton = false,
  shareTitle,
  shareText,
  shareUrl,
}: SocialIconsProps) => {
  const [copied, setCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const defaultLinkClassName =
    'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-300 hover:scale-110 hover:border-blue-400/50 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer';

  const currentUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const currentTitle = shareTitle || (typeof document !== 'undefined' ? document.title : 'Innovation X Lab');
  const currentText = shareText || 'Read this article on Innovation X Lab.';

  const handleCopy = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined' || !navigator.share) {
      setShareMenuOpen(true);
      return;
    }

    try {
      await navigator.share({
        title: currentTitle,
        text: currentText,
        url: currentUrl,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setShareMenuOpen(true);
      }
    }
  };

  const handleFallbackShare = (mode: 'copy' | 'facebook' | 'x' | 'linkedin' | 'whatsapp' | 'email') => {
    if (typeof window === 'undefined') {
      return;
    }

    const encodedUrl = encodeURIComponent(currentUrl || window.location.href);
    const encodedTitle = encodeURIComponent(currentTitle);

    switch (mode) {
      case 'copy':
        void handleCopy();
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=700');
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${currentTitle}\n${currentText}`)}&url=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=700');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=700');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${currentTitle}\n${currentText}\n${currentUrl || window.location.href}`)}`, '_blank', 'noopener,noreferrer,width=600,height=700');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${currentText}\n\n${currentUrl || window.location.href}`)}`, '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }

    setShareMenuOpen(false);
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
      {includeShareButton ? (
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share article"
          className={`${defaultLinkClassName} ${linkClassName}`.trim()}
        >
          <Share2 size={18} />
        </button>
      ) : null}
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
      {shareMenuOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/10 bg-slate-900/95 p-5 shadow-[0_20px_70px_rgba(2,8,23,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">Share this story</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Choose how to share</h3>
              </div>
              <button type="button" onClick={() => setShareMenuOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300">Close</button>
            </div>

            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => handleFallbackShare('copy')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Copy Link</span>
                <Copy size={16} />
              </button>
              <button type="button" onClick={() => handleFallbackShare('facebook')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Share to Facebook</span>
                <span className="text-cyan-300">f</span>
              </button>
              <button type="button" onClick={() => handleFallbackShare('x')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Share to X</span>
                <span className="text-cyan-300">X</span>
              </button>
              <button type="button" onClick={() => handleFallbackShare('linkedin')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Share to LinkedIn</span>
                <span className="text-cyan-300">in</span>
              </button>
              <button type="button" onClick={() => handleFallbackShare('whatsapp')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Share to WhatsApp</span>
                <span className="text-cyan-300">💬</span>
              </button>
              <button type="button" onClick={() => handleFallbackShare('email')} className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300">
                <span>Email</span>
                <span className="text-cyan-300">✉</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SocialIcons;
