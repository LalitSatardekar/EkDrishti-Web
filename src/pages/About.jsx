//original about 
import { useState } from 'react'
import { stats } from '../data/content'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const About = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(1)

  const faqItems = [
    {
      id: 1,
      question: 'What services do you offer?',
      answer: 'We offer a comprehensive range of digital marketing services including branding, digital strategy, content marketing, social media management, SEO optimization, and paid advertising campaigns. Our team works collaboratively to create integrated solutions tailored to your brand\'s unique needs.'
    },
    {
      id: 2,
      question: 'How long does a typical project take?',
      answer: 'Project timelines vary depending on scope and complexity. Most strategy and planning projects take 4-8 weeks, while larger campaigns can span 3-6 months or longer. We\'ll provide a detailed timeline during the discovery phase and keep you updated throughout the process.'
    },
    {
      id: 3,
      question: 'Do you work with startups and small businesses?',
      answer: 'Absolutely! We work with businesses of all sizes, from exciting startups to established enterprises. We believe great ideas deserve great execution, regardless of company size. Our scalable approach allows us to deliver impact within various budget ranges.'
    },
    {
      id: 4,
      question: 'How do you measure campaign success?',
      answer: 'We believe in data-driven results. We establish clear KPIs at the start of every project and use advanced analytics tools to track performance. Regular reporting and optimization ensure we\'re always working towards your business goals. You\'ll have complete visibility into every metric that matters.'
    },
    {
      id: 5,
      question: 'What is your creative process?',
      answer: 'Our process begins with deep discovery and research to understand your brand, audience, and market landscape. We then develop strategy-driven creative concepts, iterate based on feedback, and implement with precision. Continuous optimization based on performance data ensures results improve over time.'
    },
    {
      id: 6,
      question: 'How can I get started working with you?',
      answer: 'Simply reach out through our contact page or email us directly. We\'ll schedule a consultation call to understand your needs, challenges, and goals. From there, we\'ll provide a customized proposal and timeline. Let\'s create something amazing together!'
    }
  ]

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const teamMembers = [
    { name: 'Team Member 1', role: 'Creative Director', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Team Member 2', role: 'Strategy Lead', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Team Member 3', role: 'Marketing Director', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' },
    { name: 'Team Member 4', role: 'Tech Lead', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  ]

  const leadershipTeam = [
    { name: 'Leader Name 1', designation: 'Co-Founder & CEO', image: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Leader1' },
    { name: 'Leader Name 2', designation: 'Co-Founder & Strategy Head', image: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Leader1' },
    { name: 'Leader Name 3', designation: 'Creative & Operations Head', image: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Leader1' },
  ]

  return (
    <div className="py-24">
      <div className="section-container">
       {/* Hero Section (Replaces First About Us Section) */}
<div className="relative mb-24">
  {/* Group Image */}
  <img
    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
    alt="Team Group"
    className="w-full h-[420px] md:h-[520px] object-cover rounded-2xl"
  />

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/40 rounded-2xl" />

  {/* Bottom-center elegant tagline */}
<div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center px-6">
  <h1 className="
    text-3xl md:text-5xl lg:text-6xl
    font-heading font-semibold
    text-white uppercase
    tracking-[0.25em]
    drop-shadow-[0_6px_28px_rgba(0,0,0,0.65)]
  ">
    REFINED VISION. REAL IMPACT.
  </h1>

  {/* subtle premium underline */}
  <div className="mt-4 h-[2px] w-28 mx-auto bg-white/70 rounded-full shadow-lg" />
</div>

</div>


        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-textSecondary text-lg leading-relaxed">
              <p>
                Founded in 2016, we started with a simple mission: to help businesses build meaningful connections with their audiences through strategic digital marketing.
              </p>
              <p>
                Over the years, we've grown from a small team of three to a dynamic agency of 40+ talented professionals, serving clients across the globe and generating over $50M in revenue for our partners.
              </p>
              <p>
                Our approach combines data-driven insights with creative excellence, ensuring every campaign not only looks great but delivers measurable results.
              </p>
            </div>
          </div>
          <div className="aspect-square rounded-2xl bg-surface flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🏢</div>
              <p className="text-textSecondary font-medium">ABOUT IMAGE</p>
              <p className="text-sm text-textSecondary/70">Company/Team Photo</p>
            </div>
          </div>
        </div>

        
        

        {/* Leadership */}
<div className="mb-32">
  <div className="section-container">
    <h2 className="text-4xl font-heading font-bold text-textPrimary mb-16 text-center">
      Leadership
    </h2>

    {/* Tight professional spacing */}
    <div className="flex justify-center items-end gap-4">
      {leadershipTeam.map((leader, index) => {
        const isCenter = index === 1;
        const sizeClass = isCenter ? "w-[360px]" : "w-[280px]";

        return (
          <div
            key={leader.name}
            className={`relative overflow-hidden ${sizeClass}`}
            style={{
              aspectRatio: "0.7 / 1",
              borderRadius: "220px 220px 6px 6px",
              background:
                "linear-gradient(180deg, #FF7A00 0%, #FF5C00 45%, #E64500 100%)",
            }}
          >
            {/* Top soft highlight */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: "65%",
                height: "90px",
                background: "rgba(255,255,255,0.10)",
                borderRadius: "0 0 120px 120px",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Leader Name */}
            <h3
              className="font-heading font-bold text-white text-center"
              style={{
                position: "absolute",
                top: isCenter ? "40px" : "32px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: isCenter ? "26px" : "19px",
                letterSpacing: "0.3px",
                textShadow: "0 6px 18px rgba(0,0,0,0.45)",
                zIndex: 3,
                whiteSpace: "nowrap",
              }}
            >
              {leader.name}
            </h3>

            {/* Portrait */}
            <img
              src="https://pngimg.com/uploads/man/man_PNG6531.png"
              alt={leader.name}
              className="absolute left-1/2 -translate-x-1/2 object-contain"
              style={{
                bottom: "-10px",          // creates top breathing space
                width: "80%",             // prevents head touching arch
                filter:
                  "drop-shadow(0 14px 28px rgba(0,0,0,0.38)) grayscale(100%)",
                transition: "all 300ms ease",
                zIndex: 2,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter =
                  "drop-shadow(0 14px 28px rgba(0,0,0,0.38)) grayscale(0%)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter =
                  "drop-shadow(0 14px 28px rgba(0,0,0,0.38)) grayscale(100%)")
              }
            />

            {/* Designation — always visible */}
            <p
              className="text-white text-center font-semibold"
              style={{
                position: "absolute",
                bottom: "22px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: isCenter ? "15px" : "13px",
                opacity: 0.95,
                letterSpacing: "0.4px",
                textShadow: "0 4px 10px rgba(0,0,0,0.35)",
                whiteSpace: "nowrap",
                zIndex: 4,
              }}
            >
              {leader.designation}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</div>





        {/* Team */}
<div className="mb-24">
  <h2 className="text-4xl font-heading font-bold text-textPrimary mb-12 text-center">
    Meet the Team
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
    {teamMembers.map((member) => (
      <div key={member.name} className="glass-card p-6 text-center">
        
        {/* Image Wrapper for grayscale hover */}
        <div className="overflow-hidden rounded-xl mb-4">
          <img
            src={
              member.avatar ||
              "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80"
            }
            alt={member.name}
            className="
              w-full aspect-square object-cover
              transition duration-300 ease-in-out
              grayscale hover:grayscale-0
            "
          />
        </div>

        <h4 className="font-heading font-bold text-textPrimary mb-2">
          {member.name}
        </h4>

        <p className="text-textSecondary text-sm">
          {member.role}
        </p>
      </div>
    ))}
  </div>
</div>


        {/* FAQ Section */}
        <div className="mb-32">
          <h2 className="text-4xl font-heading font-bold text-textPrimary mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-[16px]">
            {faqItems.map((item) => (
              <div key={item.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 group ${
                expandedFAQ === item.id ? 'border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)]' : 'border-borderSubtle hover:border-amber-500 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]'
              }`}>
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="faq-button w-full px-6 py-4 flex items-center justify-between bg-surface hover:bg-secondary text-left transition-colors duration-200"
                >
                  <h3 className={`font-heading font-semibold text-lg transition-colors duration-200 ${
                    expandedFAQ === item.id ? 'text-amber-500' : 'text-textPrimary group-hover:text-amber-500'
                  }`}>
                    {item.question}
                  </h3>
                  <ExpandMoreIcon className={`text-xl transition-all duration-300 flex-shrink-0 ml-4 ${
                    expandedFAQ === item.id ? 'text-amber-500 rotate-180' : 'text-amber-500 group-hover:text-amber-500'
                  }`} />
                </button>
                {expandedFAQ === item.id && (
                  <div className="px-6 py-4 bg-primary border-t border-borderSubtle">
                    <p className="text-textSecondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
