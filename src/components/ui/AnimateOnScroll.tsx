import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-in-right' | 'slide-in-left';
  delay?: number;
  threshold?: number;
}

export default function AnimateOnScroll({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after it becomes visible once
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const baseClasses = 'transition-all duration-700 ease-out';
  
  const animations = {
    'fade-up': cn(
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    ),
    'fade-in': cn(
      isVisible ? 'opacity-100' : 'opacity-0'
    ),
    'slide-in-right': cn(
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
    ),
    'slide-in-left': cn(
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
    ),
  };

  return (
    <div
      ref={ref}
      className={cn(baseClasses, animations[animation], className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
