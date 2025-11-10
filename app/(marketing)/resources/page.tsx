'use client';

import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, Search, Filter } from 'lucide-react';

// Mock blog data - in production, this would come from CMS or database
const blogPosts = [
  {
    id: 'guidewire-talent-shortage-2025',
    slug: 'guidewire-talent-shortage-2025',
    title: 'The Guidewire Talent Shortage: Why 2025 is Different',
    excerpt: 'The insurance tech landscape is evolving rapidly, and the demand for Guidewire professionals has never been higher. Learn why traditional recruitment strategies are failing and what works today.',
    category: 'Industry Insights',
    author: 'Sumanth Nagolu',
    date: '2025-01-15',
    readTime: '8 min read',
    image: '/blog/guidewire-shortage.jpg',
    featured: true
  },
  {
    id: 'h1b-to-canada-complete-guide',
    slug: 'h1b-to-canada-complete-guide',
    title: 'H1B to Canada: The Complete 2025 Migration Guide',
    excerpt: 'Thinking about moving from H1B to Canada? This comprehensive guide covers everything from Express Entry to job hunting, visa timelines, and settling in.',
    category: 'Immigration',
    author: 'Sumanth Nagolu',
    date: '2025-01-12',
    readTime: '12 min read',
    image: '/blog/h1b-canada.jpg',
    featured: true
  },
  {
    id: 'ai-recruitment-transformation',
    slug: 'ai-recruitment-transformation',
    title: 'How AI is Transforming Tech Recruitment in 2025',
    excerpt: 'From resume screening to candidate matching, AI is revolutionizing how we find and place talent. Discover how InTime uses AI to deliver candidates in 48 hours.',
    category: 'Technology',
    author: 'Sumanth Nagolu',
    date: '2025-01-10',
    readTime: '6 min read',
    image: '/blog/ai-recruitment.jpg',
    featured: false
  },
  {
    id: 'guidewire-certification-worth-it',
    slug: 'guidewire-certification-worth-it',
    title: 'Is Guidewire Certification Worth It? ROI Analysis',
    excerpt: 'Breaking down the real costs and benefits of Guidewire certification. Spoiler: Most certified professionals see 30%+ salary increases.',
    category: 'Career Development',
    author: 'Sumanth Nagolu',
    date: '2025-01-08',
    readTime: '10 min read',
    image: '/blog/certification-roi.jpg',
    featured: false
  },
  {
    id: 'remote-work-staffing-challenges',
    slug: 'remote-work-staffing-challenges',
    title: '5 Remote Work Challenges in Tech Staffing (And Solutions)',
    excerpt: 'Remote hiring brings unique challenges. Learn how forward-thinking companies are adapting their recruitment strategies for the distributed workforce era.',
    category: 'Best Practices',
    author: 'Sumanth Nagolu',
    date: '2025-01-05',
    readTime: '7 min read',
    image: '/blog/remote-work.jpg',
    featured: false
  },
  {
    id: 'salary-negotiation-guide-tech',
    slug: 'salary-negotiation-guide-tech',
    title: 'The Ultimate Salary Negotiation Guide for Tech Professionals',
    excerpt: 'Master the art of salary negotiation. Real examples, scripts, and strategies that have helped our candidates secure $20K+ increases.',
    category: 'Career Development',
    author: 'Sumanth Nagolu',
    date: '2025-01-03',
    readTime: '11 min read',
    image: '/blog/salary-negotiation.jpg',
    featured: false
  },
  {
    id: 'building-guidewire-coe',
    slug: 'building-guidewire-coe',
    title: 'Building a Guidewire Center of Excellence: A Blueprint',
    excerpt: 'Want to establish a Guidewire COE? This step-by-step guide covers team structure, skill requirements, timelines, and budget planning.',
    category: 'Consulting',
    author: 'Sumanth Nagolu',
    date: '2025-01-01',
    readTime: '15 min read',
    image: '/blog/coe-blueprint.jpg',
    featured: false
  },
  {
    id: 'contractor-vs-fulltime',
    slug: 'contractor-vs-fulltime',
    title: 'Contractor vs. Full-Time: What\'s Right for Your Project?',
    excerpt: 'The eternal debate. We break down costs, flexibility, and outcomes to help you make the right hiring decision.',
    category: 'Best Practices',
    author: 'Sumanth Nagolu',
    date: '2024-12-28',
    readTime: '9 min read',
    image: '/blog/contractor-fulltime.jpg',
    featured: false
  },
  {
    id: 'tech-talent-retention-strategies',
    slug: 'tech-talent-retention-strategies',
    title: '10 Proven Strategies to Retain Top Tech Talent',
    excerpt: 'Hiring is expensive. Retention is crucial. Learn the strategies that reduce turnover and keep your best people engaged.',
    category: 'Best Practices',
    author: 'Sumanth Nagolu',
    date: '2024-12-25',
    readTime: '8 min read',
    image: '/blog/retention.jpg',
    featured: false
  },
  {
    id: 'cross-border-hiring-trends',
    slug: 'cross-border-hiring-trends',
    title: 'Cross-Border Hiring Trends: US, Canada, India in 2025',
    excerpt: 'Global talent pools are more accessible than ever. Understand the legal, logistical, and cultural considerations for international hiring.',
    category: 'Industry Insights',
    author: 'Sumanth Nagolu',
    date: '2024-12-22',
    readTime: '13 min read',
    image: '/blog/cross-border.jpg',
    featured: false
  }
];

const categories = [
  'All Posts',
  'Industry Insights',
  'Career Development',
  'Technology',
  'Best Practices',
  'Immigration',
  'Consulting'
];

export default function ResourcesPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue-600 via-trust-blue-500 to-innovation-orange-500 text-white py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Resources & Insights
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Expert insights on tech recruitment, career growth, immigration, and industry trends.
              Learn from our decade of experience placing thousands of professionals.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center gap-2 shadow-xl">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search articles..."
                className="flex-1 px-2 py-3 text-gray-900 outline-none"
              />
              <button className="btn-primary whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="section-container py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  category === 'All Posts'
                    ? 'bg-trust-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section-container py-16">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8">
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/resources/${post.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl hover:border-trust-blue-300 transition-all"
              >
                {/* Article Image */}
                <div className="h-64 bg-gradient-to-br from-trust-blue-100 to-innovation-orange-100 relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-6xl">📰</span></div>';
                      }
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-trust-blue-100 text-trust-blue-700 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                    <span className="px-3 py-1 bg-innovation-orange-100 text-innovation-orange-700 rounded-full text-xs font-semibold">
                      ⭐ FEATURED
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3 group-hover:text-trust-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-trust-blue-600 font-medium group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8">
            Latest Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/resources/${post.slug}`}
                className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg hover:border-trust-blue-300 transition-all"
              >
                {/* Article Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-5xl">📄</span></div>';
                      }
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 mt-4 group-hover:text-trust-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container py-20">
        <div className="bg-gradient-to-br from-trust-blue-600 to-innovation-orange-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Want Personalized Insights?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get expert advice tailored to your hiring challenges or career goals.
            Schedule a free 15-minute consultation.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-trust-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            Book Your Free Consultation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

