import { Facebook, Instagram, Linkedin, Twitter, type LucideIcon } from 'lucide-react';

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
}

export const socialLinks: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1BeR8X7ZrW/',
    icon: Facebook,
    ariaLabel: 'Follow Innovation X Lab on Facebook',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/innovation_x_lab?igsh=aDhwcG1objF5MjZh',
    icon: Instagram,
    ariaLabel: 'Follow Innovation X Lab on Instagram',
  },
  {
    label: 'X',
    href: 'https://x.com/Innovationxlab_',
    icon: Twitter,
    ariaLabel: 'Follow Innovation X Lab on X',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/innovation-x-lab/',
    icon: Linkedin,
    ariaLabel: 'Follow Innovation X Lab on LinkedIn',
  },
];
