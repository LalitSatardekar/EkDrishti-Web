import { useState } from 'react'
import SEO from '../components/ui/SEO'
import { faqItems, teamMembers, leadershipTeam, visionContent } from '../data/aboutContent'

const About = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(1)

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Ekdrishti Studios - our vision, team, and commitment to excellence in digital marketing and event photography."
        keywords="about ekdrishti, our team, company vision, digital marketing agency, event photography studio"
      />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-32">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-6">
              {visionContent.title}
            </h2>
            <div className="space-y-4 text-textSecondary text-base md:text-lg leading-relaxed">
              {visionContent.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Ekdrishti Studios team collaboration"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        
        

        {/* Leadership */}
<div className="mb-32">
  <div className="section-container">
    <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-12 md:mb-16 text-center">
      Leadership
    </h2>

    {/* Responsive layout: vertical on mobile, horizontal on desktop */}
    <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-8 md:gap-4 lg:gap-4">
      {leadershipTeam.map((leader, index) => {
        const isCenter = index === 1;
        const sizeClass = isCenter
          ? "w-full max-w-[320px] md:max-w-[320px] lg:max-w-[360px] md:w-[320px] lg:w-[360px]"
          : "w-full max-w-[280px] md:w-[240px] lg:w-[280px]";

        return (
          <div
            key={leader.name}
            className={`relative overflow-hidden ${sizeClass} mx-auto md:mx-0`}
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
                top: isCenter ? "36px" : "28px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: isCenter ? "22px" : "17px",
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
              src={leader.image}
              alt={`${leader.name}, ${leader.designation} at Ekdrishti Studios`}
              className="absolute left-1/2 -translate-x-1/2 object-contain"
              loading="lazy"
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
                bottom: "18px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: isCenter ? "14px" : "12px",
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
  <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-12 text-center">
    Meet the Team
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
    {teamMembers.map((member) => (
      <div key={member.name} className="glass-card p-6 text-center">
        
        {/* Image Wrapper for grayscale hover */}
        <div className="overflow-hidden rounded-xl mb-4">
          <img
            src={member.avatar}
            alt={`${member.name}, ${member.role} at Ekdrishti Studios`}
            className="
              w-full aspect-square object-cover
              transition duration-300 ease-in-out
              grayscale hover:grayscale-0
            "
            loading="lazy"
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
                  aria-expanded={expandedFAQ === item.id}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <h3 className={`font-heading font-semibold text-lg transition-colors duration-200 ${
                    expandedFAQ === item.id ? 'text-amber-500' : 'text-textPrimary group-hover:text-amber-500'
                  }`}>
                    {item.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 transition-all duration-300 flex-shrink-0 ml-4 ${
                      expandedFAQ === item.id ? 'text-amber-500 rotate-180' : 'text-amber-500 group-hover:text-amber-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === item.id && (
                  <div id={`faq-answer-${item.id}`} className="px-6 py-4 bg-primary border-t border-borderSubtle">
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
    </>
  )
}

export default About