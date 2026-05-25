"use client";

import React, { useState } from 'react';
import DocLayout from '@/components/layout/DocLayout';
import { Briefcase, ArrowRight, Code, PenTool, BarChart, Shield, Globe, Users, Heart, Zap, Coffee, MapPin, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JOBS = [
  {
    id: 'frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'We are seeking an exceptionally talented Senior Frontend Engineer to lead the development of our highly interactive web interfaces. In this role, you will be responsible for creating responsive designs that work flawlessly across desktop and mobile devices. You will collaborate closely with our design and backend teams to ensure seamless integration of complex financial data streams into an intuitive user experience. If you are passionate about performance optimization, accessibility, and clean code, this role is for you.',
    requirements: [
      '5+ years of professional experience with React and modern web technologies.',
      'Deep understanding of Next.js, including Server Components and the App Router architecture.',
      'Exceptional CSS skills, with a strong preference for Tailwind CSS, and extensive experience with animation libraries such as Framer Motion.',
      'Strong focus on web accessibility standards (WCAG), performance optimization, and creating exceptional user experiences.',
      'Experience interacting with Web3 libraries (such as viem or wagmi) is a significant advantage.',
      'Excellent communication skills and the ability to articulate technical decisions to non-technical stakeholders.'
    ]
  },
  {
    id: 'backend-engineer',
    title: 'Backend Systems Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'As a Backend Systems Engineer, you will design, build, and maintain the highly scalable infrastructure that powers real-time market data, secure user authentication, and blockchain indexing for our global user base. You will work on solving complex distributed systems problems, ensuring high availability and low latency across all our services. Your work will directly impact the reliability and speed of the platform, forming the backbone of our entire technological ecosystem.',
    requirements: [
      'Strong proficiency in Node.js, TypeScript, and advanced API design (REST and GraphQL).',
      'Extensive experience with relational databases (PostgreSQL), ORMs (Prisma), and caching strategies (Redis).',
      'Solid knowledge of cloud infrastructure deployment (Vercel, AWS) and containerization technologies (Docker, Kubernetes).',
      'Deep understanding of security best practices, data protection regulations, and rate limiting mechanisms.',
      'Familiarity with Ethereum node infrastructure and interacting with RPC providers.',
      'A proven track record of writing clean, testable, and maintainable backend code.'
    ]
  },
  {
    id: 'product-designer',
    title: 'Lead Product Designer',
    department: 'Design',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'We are looking for a Lead Product Designer to shape the visual identity and user experience of Whale Alert Network. You will be tasked with designing intuitive, premium interfaces that make complex financial data easy to understand for everyday users. From wireframing to high-fidelity prototyping, you will own the end-to-end design process, ensuring our product remains visually stunning, accessible, and user-centric.',
    requirements: [
      'Extensive portfolio demonstrating high-end digital product design, particularly in complex web applications or financial dashboards.',
      'Mastery of industry-standard design tools, primarily Figma, including advanced prototyping and the creation of scalable design systems.',
      'Demonstrated ability to translate complex technical requirements into elegant, simple UI solutions.',
      'Strong understanding of modern design trends, micro-interactions, and typography.',
      'Excellent cross-functional collaboration skills, particularly in working closely with frontend engineering teams to ensure design implementation fidelity.'
    ]
  },
  {
    id: 'community-manager',
    title: 'Global Community Manager',
    department: 'Marketing',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'The Global Community Manager will be responsible for growing and nurturing our international user base across various social platforms, including Discord and Twitter. You will serve as the primary voice of Whale Alert Network and the chief advocate for our users. This role involves developing engagement strategies, organizing digital events, and acting as the vital link between our user community and our internal product teams.',
    requirements: [
      'Proven experience managing large, active online communities, preferably in the technology or finance sectors.',
      'Exceptional written and verbal communication skills, with a knack for creating engaging, clear, and empathetic content.',
      'Experience organizing online events, Ask Me Anything (AMA) sessions, and educational campaigns.',
      'A solid understanding of decentralized finance concepts and a strong empathy for user needs and pain points.',
      'The ability to gather user feedback systematically and present actionable insights to the product development team.'
    ]
  },
  {
    id: 'financial-analyst',
    title: 'Senior Market Data Analyst',
    department: 'Data',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'Join our data division to help interpret complex blockchain transactions and market trends. As a Senior Market Data Analyst, you will build automated reporting tools, define new analytical metrics, and ensure the accuracy of the financial data presented on our platform. Your insights will directly inform the features we build and the information we provide to our users.',
    requirements: [
      'Degree in Finance, Economics, Computer Science, Data Science, or a related field.',
      'Expert proficiency in SQL and Python for data analysis and visualization.',
      'Deep understanding of traditional financial markets and decentralized finance mechanics.',
      'Experience working with large datasets and utilizing BI tools (Tableau, Looker, etc.).',
      'Strong analytical mindset with an obsessive attention to detail and data accuracy.'
    ]
  }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  return (
    <DocLayout
      title="Careers at Whale Alert Network"
      description="Join our global team and help us build the most accessible, secure, and technologically advanced decentralized finance platform in the world."
      lastUpdated="May 25, 2026"
      category="Company"
    >
      <div className="space-y-16 pb-16">
        
        {/* Intro */}
        <section className="text-center max-w-4xl mx-auto pt-8">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-[#050505] leading-tight">
            Build the Future of Financial Technology
          </h2>
          <p className="text-xl text-[#050505]/70 leading-relaxed">
            We are a rapidly growing, fully remote team of software engineers, product designers, and financial innovators. Our overarching mission is to democratize access to financial technology, and we are actively seeking passionate individuals to join us on this journey. If you value professional excellence, clear communication, and user-centric design, you belong with us.
          </p>
        </section>

        {/* Culture & Perks */}
        <section>
          <h3 className="text-3xl font-black mb-10 text-[#050505] tracking-tight">Comprehensive Benefits & Culture</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Globe />, title: 'Work From Anywhere', desc: 'We are a 100% remote company. Work from the comfort of your home, a local cafe, or while traveling the world. We care entirely about your results and contributions, not your geographical location.' },
              { icon: <Heart />, title: 'Health & Wellness', desc: 'We offer comprehensive health, dental, and vision insurance for you and your dependents. Additionally, we provide a monthly wellness stipend to cover gym memberships, yoga classes, or mental health applications.' },
              { icon: <Zap />, title: 'Premium Hardware', desc: 'We provide a generous budget for your home office setup. You can choose the exact laptop, monitor, and ergonomic equipment you need to ensure you can do your best work comfortably.' },
              { icon: <Briefcase />, title: 'Flexible Time Off', desc: 'We firmly believe in working hard and resting well. Take the time you need to recharge with our highly flexible and untracked paid time off policy.' },
              { icon: <Users />, title: 'Annual Retreats', desc: 'Once a year, we fly the entire global team to a beautiful destination for a week of in-person team building, strategic planning, and celebration of our milestones.' },
              { icon: <Code />, title: 'Continuous Learning', desc: 'Continuous professional growth is essential. Enjoy a dedicated annual stipend for online courses, textbooks, industry conferences, and professional certifications.' }
            ].map((perk, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-700 group-hover:scale-110 transition-transform origin-left">
                  {perk.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-[#050505]">{perk.title}</h4>
                <p className="text-[#050505]/60 text-sm leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Extended Corporate Practices */}
        <section>
          <h3 className="text-3xl font-black mb-10 text-[#050505] tracking-tight">Performance Evaluation and Compensation Architecture</h3>
          <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
            <p>
              At Whale Alert Network, we believe that exceptional talent deserves transparent, highly competitive compensation and a clear trajectory for professional advancement. Our compensation architecture is heavily data-driven, benchmarking against the top 90th percentile of global technology firms. We conduct comprehensive bi-annual market analyses to ensure our salaries remain exceptionally competitive, regardless of macroeconomic volatility.
            </p>
            <p>
              Performance evaluations are conducted quarterly, focusing on objective deliverables, peer feedback, and alignment with our core operating principles. We do not utilize stack ranking. Instead, we evaluate employees against absolute standards of excellence. High performers are rapidly accelerated through our leveling system, with significant adjustments to base compensation and equity grants to reflect their amplified impact on the organizational ecosystem.
            </p>
          </div>
        </section>

        {/* Diversity and Inclusion */}
        <section className="bg-white p-10 rounded-3xl border border-black/10 mt-10">
          <h3 className="text-3xl font-black mb-10 text-[#050505] tracking-tight">Diversity, Equity, and Global Inclusion</h3>
          <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
            <p>
              As a protocol designed to democratize global finance, our internal workforce must reflect the diverse, international community we serve. We are unequivocally committed to fostering a workplace where differences in background, perspective, and experience are not merely accommodated, but actively sought and celebrated.
            </p>
            <p>
              Our hiring practices are strictly meritocratic and designed to mitigate unconscious bias. All technical evaluations are standardized, and interview panels are deliberately composed of cross-functional members from various geographical regions. We maintain zero tolerance for discrimination or harassment of any kind, enforcing strict codes of conduct across all internal and external communication channels.
            </p>
          </div>
        </section>

        {/* Onboarding */}
        <section className="mt-10">
          <h3 className="text-3xl font-black mb-10 text-[#050505] tracking-tight">Executive Onboarding and Mentorship Programs</h3>
          <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
            <p>
              Integrating into a high-velocity, fully remote engineering organization requires structured support. Our 90-day executive onboarding program is meticulously designed to accelerate your time-to-impact. Within your first week, you will be assigned a dedicated technical mentor and an organizational buddy to guide you through our internal architecture, proprietary tools, and operational cadence.
            </p>
            <p>
              Beyond the initial onboarding phase, we offer continuous, formalized mentorship programs. Senior engineers and department leads are incentivized to dedicate a percentage of their operational bandwidth to mentoring junior and mid-level team members, fostering a culture of continuous intellectual compounding and knowledge transfer.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#050505] text-white p-12 md:p-16 rounded-3xl">
          <h3 className="text-3xl font-black mb-10 tracking-tight">Our Operating Principles</h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><CheckCircle size={14}/></div>
                User-Centric Execution
              </h4>
              <p className="text-white/60 leading-relaxed pl-11">
                Everything we build starts with the user. We do not implement technology simply for the sake of it; we implement it to solve real, tangible problems and provide a delightful, frictionless experience for our global audience.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Users size={14}/></div>
                Transparent Communication
              </h4>
              <p className="text-white/60 leading-relaxed pl-11">
                Being a fully remote organization requires exceptional communication. We document everything meticulously, share decisions openly, and encourage constructive feedback across all levels of the company.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Shield size={14}/></div>
                Ownership & Autonomy
              </h4>
              <p className="text-white/60 leading-relaxed pl-11">
                We hire intelligent, capable people and trust them to make critical decisions. You will have profound ownership over your projects and the absolute autonomy to execute them in the most effective way possible.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Zap size={14}/></div>
                Continuous Shipping
              </h4>
              <p className="text-white/60 leading-relaxed pl-11">
                We heavily value momentum. We break down massive features into manageable, logical updates and ship them frequently. Getting features into users' hands quickly allows us to learn, adapt, and iterate faster.
              </p>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-3xl font-black text-[#050505] tracking-tight">Open Positions</h3>
            <span className="bg-slate-100 text-[#050505] border border-black/10 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest self-start sm:self-auto">
              {JOBS.length} Roles Available
            </span>
          </div>

          <div className="space-y-4">
            {JOBS.map(job => (
              <div key={job.id} className="border border-black/10 rounded-3xl overflow-hidden bg-white shadow-sm transition-all hover:border-black/20">
                <button 
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                  className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-white transition-colors text-left"
                >
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xl font-black text-[#050505]">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#050505]/50 font-medium">
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.department}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="hidden md:inline-flex px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-[#050505]">
                      {job.type}
                    </span>
                    <div className={`transform transition-transform duration-300 ${selectedJob === job.id ? 'rotate-90' : ''}`}>
                      <ArrowRight size={20} className="text-[#050505]/40" />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {selectedJob === job.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-black/5"
                    >
                      <div className="p-8 md:p-10 bg-white">
                        <h5 className="font-black text-[#050505] mb-4 text-lg">About the Role</h5>
                        <p className="text-[#050505]/70 mb-8 leading-relaxed max-w-4xl">
                          {job.description}
                        </p>
                        
                        <h5 className="font-black text-[#050505] mb-4 text-lg">Key Requirements</h5>
                        <ul className="space-y-3 mb-10 max-w-4xl">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-[#050505]/70 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-black/40 mt-2 shrink-0"/>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>

                        <button className="px-10 py-4 bg-[#050505] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-black/80 transition-colors shadow-lg active:scale-95">
                          Apply for this Position
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Application Process */}
        <section className="bg-white border border-black/10 rounded-3xl p-10 md:p-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-black mb-6 text-[#050505] tracking-tight">Our Professional Hiring Process</h3>
            <p className="text-[#050505]/70 leading-relaxed text-lg">
              We deeply value your time and effort. Our hiring process is meticulously designed to be efficient, fully transparent, and highly respectful. We aim to complete the entire evaluation process within two to three weeks from the initial contact.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 text-left">
            <div className="flex-1 bg-white p-8 rounded-3xl border border-black/5 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#050505] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">1</div>
              <h4 className="font-bold mb-3 text-[#050505] text-lg">Initial Screening Call</h4>
              <p className="text-[#050505]/60 leading-relaxed">An introductory 30-minute conversation with our internal recruitment team to discuss your professional background, past experiences, and ensure alignment on expectations.</p>
            </div>
            
            <div className="flex-1 bg-white p-8 rounded-3xl border border-black/5 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#050505] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">2</div>
              <h4 className="font-bold mb-3 text-[#050505] text-lg">Technical Evaluation</h4>
              <p className="text-[#050505]/60 leading-relaxed">A practical, non-whiteboard collaborative session with the engineering or design team to dive deep into your practical skills, architectural decisions, and portfolio projects.</p>
            </div>
            
            <div className="flex-1 bg-white p-8 rounded-3xl border border-black/5 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#050505] text-white rounded-2xl flex items-center justify-center font-black shadow-lg">3</div>
              <h4 className="font-bold mb-3 text-[#050505] text-lg">Leadership Conversation</h4>
              <p className="text-[#050505]/60 leading-relaxed">A final, comprehensive conversation with our executive leadership to ensure mutual cultural fit, align on long-term goals, and answer any remaining questions you may have.</p>
            </div>
          </div>
        </section>

      </div>
    </DocLayout>
  );
}
