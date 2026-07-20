import { ReactNode, useEffect, useRef, useState } from 'react';

type LazySectionProps = {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  rootMargin?: string;
};

const LazySection = ({ children, className, fallback, rootMargin = '200px' }: LazySectionProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShouldRender(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={containerRef} className={className}>{shouldRender ? children : (fallback ?? null)}</div>;
};

export default LazySection;
