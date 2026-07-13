export type LabCategory = 'AI' | 'Gadgets' | 'Software' | 'Coding' | 'Startups' | 'Reviews';

export interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: LabCategory;
  readingTime: string;
  image: string;
  featured?: boolean;
  author: string;
  publishedAt: string;
  content: string[];
}

export const featuredStories: Article[] = [
  {
    id: 1,
    slug: 'new-era-of-multimodal-ai',
    title: 'The New Era of Multimodal AI',
    description: 'How next-generation models are reshaping productivity, creativity, and automation.',
    category: 'AI',
    readingTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    featured: true,
    author: 'Maya Chen',
    publishedAt: 'July 12, 2026',
    content: [
      'The most compelling shift in artificial intelligence is not merely the rise of better models, but the arrival of systems that can reason across text, imagery, audio, and action in a unified workflow. For teams and creators, that transition unlocks new possibilities for product design, decision support, and knowledge work.',
      'What matters now is not just raw capability, but how responsibly these tools are integrated into business operations and daily life. The leading platforms will be defined by trust, speed, and usability.',
    ],
  },
  {
    id: 2,
    slug: 'ultra-portable-laptops-redifined',
    title: 'Ultra-Portable Laptops Redefined',
    description: 'A deep dive into the latest premium laptops built for creators and developers.',
    category: 'Gadgets',
    readingTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    author: 'Liam Ortega',
    publishedAt: 'July 8, 2026',
    content: [
      'Premium laptops are increasingly designed around portability, power, and a stronger sense of refinement. New systems now pack thermal efficiency, battery longevity, and intelligent display tuning into more compact builds.',
      'For professionals who move between studio sessions, client meetings, and travel, the difference is no longer purely hardware performance but how well the device disappears into the workflow.',
    ],
  },
  {
    id: 3,
    slug: 'future-of-developer-workflows',
    title: 'The Future of Developer Workflows',
    description: 'A review of tools helping teams ship faster without sacrificing quality.',
    category: 'Software',
    readingTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
    author: 'Noah Rivera',
    publishedAt: 'July 2, 2026',
    content: [
      'Modern engineering teams are surviving on better collaboration practices, automated feedback loops, and a higher bar for observability. The best tools now feel like invisible infrastructure rather than a burden.',
      'As the product lifecycle accelerates, software companies that prioritize clarity over complexity will be the ones that compound product quality over time.',
    ],
  },
  {
    id: 4,
    slug: 'open-source-builders-to-watch',
    title: 'Open Source Builders to Watch',
    description: 'Profiles of ambitious projects that could change how we build software.',
    category: 'Coding',
    readingTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
    author: 'Priya Shah',
    publishedAt: 'June 28, 2026',
    content: [
      'The next wave of developer tools is being shaped by those willing to build openly, iterate quickly, and connect communities around useful primitives rather than polished marketing narratives.',
      'The projects that matter most are often those that make difficult workflows feel natural, composable, and accessible to a wider audience.',
    ],
  },
  {
    id: 5,
    slug: 'why-ai-startups-are-reshaping-vc',
    title: 'Why AI Startups Are Reshaping Venture Capital',
    description: 'An analysis of the most compelling investments and founder strategies.',
    category: 'Startups',
    readingTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    author: 'Darren Cole',
    publishedAt: 'June 20, 2026',
    content: [
      'The fundraising environment is more selective than ever, but the strongest founders are still finding capital by demonstrating leverage, product conviction, and a differentiated go-to-market plan.',
      'For AI-driven startups, the strategic edge is rarely only technology. It is the way the team turns emerging capability into durable customer value.',
    ],
  },
];

export const trendingArticles: Article[] = [
  {
    id: 6,
    slug: 'ai-productivity-agents-are-here',
    title: 'AI Productivity Agents Are Here',
    description: 'The tools automating research, writing, and decision support.',
    category: 'AI',
    readingTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    author: 'Sara Kim',
    publishedAt: 'June 18, 2026',
    content: [
      'Productivity agents are shifting from experimentation to meaningful workflow integration. Their value is measured by what they save, simplify, or unlock for teams.',
      'As these systems improve, the best products are those that combine clear automation with respectful user controls and transparent reasoning.',
    ],
  },
  {
    id: 7,
    slug: 'best-smart-home-devices-2026',
    title: 'Best Smart Home Devices of 2026',
    description: 'From ambient lighting to adaptive security, these devices feel truly next-gen.',
    category: 'Gadgets',
    readingTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    author: 'Evan Brooks',
    publishedAt: 'June 13, 2026',
    content: [
      'The smart home category has matured beyond novelty into a more thoughtful layer of comfort, safety, and environmental awareness.',
      'New devices are increasingly context-aware and integrated, making them far more useful as part of a coherent living space than as standalone gadgets.',
    ],
  },
  {
    id: 8,
    slug: 'saas-tools-for-high-performance-teams',
    title: 'SaaS Tools for High-Performance Teams',
    description: 'The stack modern companies are adopting to operate with clarity.',
    category: 'Software',
    readingTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    author: 'Alicia Stone',
    publishedAt: 'June 10, 2026',
    content: [
      'High-performance teams are choosing tools that reduce friction while increasing visibility, alignment, and execution quality.',
      'The new standard is not simply feature breadth but how seamlessly software supports decision-making across the organisation.',
    ],
  },
];

export const allArticles: Article[] = [...featuredStories, ...trendingArticles];

export const labSections = [
  { title: 'AI Lab', href: '/ai-lab', description: 'AI news, tools, tutorials, and experiments.' },
  { title: 'Gadget Lab', href: '/gadget-lab', description: 'Smartphones, laptops, smart devices, and comparisons.' },
  { title: 'Software Lab', href: '/software-lab', description: 'SaaS reviews, developer tools, and productivity apps.' },
  { title: 'Code Lab', href: '/code-lab', description: 'Programming tutorials, resources, and project showcases.' },
  { title: 'Startup Lab', href: '/startup-lab', description: 'Founder interviews and startup innovation stories.' },
  { title: 'Review Lab', href: '/review', description: 'Detailed product reviews and testing reports.' },
];
