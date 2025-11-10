'use client';

import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Linkedin, Twitter, Facebook } from 'lucide-react';
import { use } from 'react';

// Mock blog data - in production, this would come from CMS or database
const blogPosts = [
  {
    id: 'guidewire-talent-shortage-2025',
    slug: 'guidewire-talent-shortage-2025',
    title: 'The Guidewire Talent Shortage: Why 2025 is Different',
    excerpt: 'The insurance tech landscape is evolving rapidly, and the demand for Guidewire professionals has never been higher.',
    category: 'Industry Insights',
    author: 'Sumanth Nagolu',
    date: '2025-01-15',
    readTime: '8 min read',
    image: '/blog/guidewire-shortage.jpg',
    featured: true,
    content: `
      <h2>The Growing Demand Crisis</h2>
      <p>The insurance technology sector is experiencing an unprecedented surge in demand for Guidewire-certified professionals. With over 400 insurance carriers worldwide relying on the Guidewire platform, the talent gap has never been more acute.</p>

      <h2>Why Traditional Recruitment Fails</h2>
      <p>Traditional recruitment methods are struggling to keep pace with the specialized nature of Guidewire roles. Here's why:</p>
      <ul>
        <li><strong>Niche Skillset:</strong> Guidewire expertise requires both insurance domain knowledge and technical proficiency—a rare combination.</li>
        <li><strong>Long Ramp-Up Time:</strong> Training new developers on Guidewire takes 6-12 months, making experienced hires highly valuable.</li>
        <li><strong>Competitive Market:</strong> Top talent is receiving multiple offers, often within 48 hours of becoming available.</li>
      </ul>

      <h2>What's Working in 2025</h2>
      <p>Forward-thinking companies are adopting new strategies to attract and retain Guidewire talent:</p>
      <ol>
        <li><strong>Speed Matters:</strong> Companies that move fast (24-48 hour response times) are winning the best candidates.</li>
        <li><strong>Remote-First Approach:</strong> Geographic restrictions are outdated. The best companies hire globally and provide relocation support when needed.</li>
        <li><strong>Career Development:</strong> Offering certification sponsorship and continuous learning paths is now table stakes.</li>
      </ol>

      <h2>The InTime Advantage</h2>
      <p>At InTime eSolutions, we've specialized in Guidewire recruitment for over a decade. Our proprietary talent network and AI-powered matching enable us to deliver qualified candidates in 24-48 hours—not weeks or months.</p>

      <h3>Our 3-Step Approach:</h3>
      <ol>
        <li><strong>Pre-Vetted Network:</strong> We maintain relationships with 2,000+ Guidewire professionals actively seeking new opportunities.</li>
        <li><strong>Technical Screening:</strong> Every candidate undergoes rigorous technical assessment before being presented to clients.</li>
        <li><strong>Cultural Fit Analysis:</strong> We use behavioral assessments to ensure candidates align with your company culture.</li>
      </ol>

      <h2>Looking Ahead</h2>
      <p>The Guidewire talent shortage isn't going away anytime soon. In fact, with new product releases (Jutro, Guidewire Cloud) and ongoing digital transformation initiatives, demand will only intensify.</p>
      
      <p>The winners in this market will be companies that partner with specialized recruiters who understand the insurance tech ecosystem and can move at the speed of modern hiring.</p>

      <div class="bg-trust-blue-50 p-6 rounded-xl my-8">
        <h3 class="text-xl font-bold text-trust-blue mb-4">Need Guidewire Talent Fast?</h3>
        <p class="mb-4">We deliver pre-vetted, certified Guidewire professionals in 24-48 hours. No retainers. No long-term contracts. Just results.</p>
        <a href="/contact" class="btn-primary inline-block">Get Matched with Top Talent →</a>
      </div>
    `
  },
  {
    id: 'h1b-to-canada-complete-guide',
    slug: 'h1b-to-canada-complete-guide',
    title: 'H1B to Canada: The Complete 2025 Migration Guide',
    excerpt: 'Thinking about moving from H1B to Canada? This comprehensive guide covers everything from Express Entry to job hunting.',
    category: 'Immigration',
    author: 'Sumanth Nagolu',
    date: '2025-01-12',
    readTime: '12 min read',
    image: '/blog/h1b-canada.jpg',
    featured: true,
    content: `
      <h2>Why Tech Professionals Are Choosing Canada</h2>
      <p>With H1B visa uncertainties and long green card wait times, thousands of tech professionals are exploring Canadian immigration. The good news? Canada actively welcomes skilled workers, especially in technology.</p>

      <h2>Your Immigration Pathways</h2>
      <h3>1. Express Entry (Most Common)</h3>
      <p>Express Entry is Canada's flagship immigration program for skilled workers. Here's how it works:</p>
      <ul>
        <li><strong>Comprehensive Ranking System (CRS):</strong> Points are awarded based on age, education, work experience, and language proficiency.</li>
        <li><strong>Typical Score Range:</strong> Tech professionals usually score 450-500 points, well above the cutoff (typically 480-490).</li>
        <li><strong>Processing Time:</strong> 6-8 months from invitation to permanent residence.</li>
      </ul>

      <h3>2. Provincial Nominee Programs (PNPs)</h3>
      <p>Provinces like Ontario (OINP), British Columbia (BC PNP), and Alberta (AINP) have tech-focused streams:</p>
      <ul>
        <li><strong>Lower CRS Requirements:</strong> Can add 600 points to your Express Entry profile</li>
        <li><strong>Job Offer Advantage:</strong> Having a Canadian job offer significantly boosts your chances</li>
      </ul>

      <h3>3. Intra-Company Transfer (ICT)</h3>
      <p>Already working for a multinational? Ask about transferring to their Canadian office—fastest path to PR.</p>

      <h2>Step-by-Step Migration Timeline</h2>
      <h3>Month 1-2: Preparation</h3>
      <ol>
        <li><strong>IELTS/CELPIP Exam:</strong> Schedule and take your English proficiency test (aim for CLB 9+)</li>
        <li><strong>Educational Credential Assessment (ECA):</strong> Get your degree evaluated by WES or ICAS</li>
        <li><strong>Start Job Search:</strong> Update LinkedIn, apply to Canadian companies</li>
      </ol>

      <h3>Month 3-4: Create Express Entry Profile</h3>
      <ol>
        <li>Calculate your CRS score (use Canada's official calculator)</li>
        <li>Create Express Entry profile</li>
        <li>Apply for Provincial Nomination if applicable</li>
      </ol>

      <h3>Month 5-12: Post-ITA Process</h3>
      <ol>
        <li>Receive Invitation to Apply (ITA)</li>
        <li>Submit complete application with documents</li>
        <li>Medical exams and police clearances</li>
        <li>Receive Confirmation of Permanent Residence (COPR)</li>
      </ol>

      <h2>Job Market Reality Check</h2>
      <p><strong>The Good News:</strong></p>
      <ul>
        <li>Canada has 250,000+ open tech positions</li>
        <li>Average tech salary: CAD $85,000-$130,000</li>
        <li>Major tech hubs: Toronto, Vancouver, Montreal, Ottawa, Calgary</li>
      </ul>

      <p><strong>The Challenges:</strong></p>
      <ul>
        <li>Canadian experience often preferred (plan for 1-2 steps back initially)</li>
        <li>Salaries are 20-30% lower than US (but cost of living is also lower)</li>
        <li>Networking is crucial—join Slack communities, attend meetups</li>
      </ul>

      <h2>Financial Considerations</h2>
      <p><strong>Estimated Costs:</strong></p>
      <ul>
        <li>IELTS/CELPIP: CAD $300</li>
        <li>ECA: CAD $200-250</li>
        <li>Express Entry Application: CAD $1,325 (single) / $2,140 (couple)</li>
        <li>Medical Exam: CAD $250-450 per person</li>
        <li>Settlement Funds: CAD $13,000 (single) / $17,000 (couple) — proof of funds required</li>
      </ul>

      <h2>InTime's Cross-Border Solutions</h2>
      <p>We specialize in helping H1B professionals transition to Canada with our comprehensive support package:</p>
      <ul>
        <li><strong>Job Placement:</strong> Access to 500+ Canadian employers actively hiring international talent</li>
        <li><strong>Resume Optimization:</strong> Canadian-format resumes that get interviews</li>
        <li><strong>Immigration Guidance:</strong> Partner referrals to licensed immigration consultants</li>
        <li><strong>Relocation Support:</strong> Housing, banking, and settling-in assistance</li>
      </ul>

      <div class="bg-success-green-50 p-6 rounded-xl my-8">
        <h3 class="text-xl font-bold text-success-green mb-4">Ready to Make the Move?</h3>
        <p class="mb-4">Book a free consultation with our cross-border specialists. We'll assess your profile, provide a realistic timeline, and connect you with Canadian employers.</p>
        <a href="/solutions/cross-border" class="btn-primary inline-block">Explore Cross-Border Solutions →</a>
      </div>
    `
  },
  {
    id: 'ai-recruitment-transformation',
    slug: 'ai-recruitment-transformation',
    title: 'How AI is Transforming Tech Recruitment in 2025',
    excerpt: 'From resume screening to candidate matching, AI is revolutionizing how we find and place talent.',
    category: 'Technology',
    author: 'Sumanth Nagolu',
    date: '2025-01-10',
    readTime: '6 min read',
    image: '/blog/ai-recruitment.jpg',
    featured: false,
    content: `
      <h2>The AI Revolution in Recruitment</h2>
      <p>Artificial Intelligence is fundamentally changing how we source, screen, and match tech talent. What used to take weeks now happens in hours—without sacrificing quality.</p>

      <h2>Key AI Applications in Modern Recruitment</h2>
      
      <h3>1. Intelligent Resume Screening</h3>
      <p>Traditional keyword matching is dead. Modern AI analyzes:</p>
      <ul>
        <li>Skill progression and growth trajectory</li>
        <li>Project complexity and impact</li>
        <li>Technology stack evolution</li>
        <li>Cultural indicators and soft skills</li>
      </ul>

      <h3>2. Predictive Candidate Matching</h3>
      <p>Our AI models predict candidate success by analyzing:</p>
      <ul>
        <li>Historical placement data (10+ years of successful placements)</li>
        <li>Company culture signals</li>
        <li>Team composition and dynamics</li>
        <li>Career motivation patterns</li>
      </ul>

      <h3>3. Automated Outreach & Engagement</h3>
      <p>Personalized, timely communication at scale—without sounding robotic.</p>

      <h2>The Human Touch Still Matters</h2>
      <p>AI accelerates the process, but human judgment remains crucial for:</p>
      <ul>
        <li>Assessing cultural fit nuances</li>
        <li>Negotiating complex compensation packages</li>
        <li>Navigating sensitive career transitions</li>
        <li>Building long-term relationships</li>
      </ul>

      <h2>InTime's AI-Powered Approach</h2>
      <p>We've invested heavily in proprietary AI tools that:</p>
      <ul>
        <li>Screen 1,000+ resumes in minutes (not days)</li>
        <li>Match candidates with 95% accuracy</li>
        <li>Predict offer acceptance probability</li>
        <li>Optimize compensation packages for mutual benefit</li>
      </ul>

      <div class="bg-innovation-orange-50 p-6 rounded-xl my-8">
        <h3 class="text-xl font-bold text-innovation-orange mb-4">Experience AI-Powered Recruitment</h3>
        <p class="mb-4">See how we deliver vetted candidates in 24-48 hours using AI + human expertise.</p>
        <a href="/contact" class="btn-primary inline-block">Request Demo →</a>
      </div>
    `
  }
];

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-wisdom-gray-700 mb-4">Article Not Found</h1>
          <p className="text-wisdom-gray-600 mb-8">The article you're looking for doesn't exist yet.</p>
          <Link href="/resources" className="btn-primary inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue-600 to-trust-blue-700 text-white py-16">
        <div className="section-container">
          <Link href="/resources" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
          
          <div className="max-w-4xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold">{post.category}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <div className="section-container -mt-16 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-trust-blue-100 to-innovation-orange-100 rounded-2xl shadow-2xl overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex items-center justify-center h-full">
              <span className="text-8xl">📰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="section-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-trust-blue max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="article-content"
            />
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-wisdom-gray-700">Share this article</h3>
              <div className="flex gap-3">
                <button className="h-10 w-10 rounded-full bg-trust-blue-100 hover:bg-trust-blue text-trust-blue hover:text-white flex items-center justify-center transition-colors">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-trust-blue-100 hover:bg-trust-blue text-trust-blue hover:text-white flex items-center justify-center transition-colors">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-trust-blue-100 hover:bg-trust-blue text-trust-blue hover:text-white flex items-center justify-center transition-colors">
                  <Facebook className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-wisdom-gray-50 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-trust-blue text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {post.author.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-wisdom-gray-700 mb-2">{post.author}</h3>
                <p className="text-wisdom-gray-600">
                  CEO & Founder at InTime eSolutions. Over a decade of experience in tech staffing, cross-border hiring, and Guidewire consulting. Passionate about connecting talent with opportunity.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-r from-trust-blue to-trust-blue-600 rounded-2xl text-white text-center">
            <h3 className="text-2xl font-heading font-bold mb-4">Ready to Take Action?</h3>
            <p className="mb-6 text-white/90">
              Whether you're looking for talent or seeking your next opportunity, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">
                Get in Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/resources" className="btn-outline inline-flex items-center justify-center">
                Read More Articles
              </Link>
            </div>
          </div>
        </div>
      </article>

    </div>
  );
}
