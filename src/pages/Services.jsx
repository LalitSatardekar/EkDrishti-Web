import { services, pricingPlans, testimonials } from '../data/content'
import CinematicStackedCarousel from '../components/packages/CinematicStackedCarousel'
import { TestimonialCard } from '../components/sections/Testimonials'
import FAQ from '../components/sections/FAQ'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const InteractiveServiceCard = ({ service, index }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface/80 via-surface/60 to-surface/40 backdrop-blur-sm border border-borderSubtle" />
      
      {/* Animated gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#F2A020]/10 via-accent/10 to-accentLight/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Glowing corner effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F2A020]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative p-8 lg:p-10 space-y-6">
        {/* Icon with animation */}
        <div className="relative inline-block">
          <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {service.icon}
          </div>
          <div className="absolute inset-0 bg-[#F2A020]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Number badge */}
        <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
          <span className="text-accent font-bold">0{index + 1}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-textPrimary group-hover:text-[#F2A020] transition-colors duration-300">
          {service.title}
        </h3>
        
        {/* Description */}
        <p className="text-textSecondary leading-relaxed">
          {service.description}
        </p>
        
        {/* Features list with animated checkmarks */}
        <ul className="space-y-3 pt-4">
          {['Strategic Planning', 'Expert Execution', 'Analytics & Growth'].map((item, i) => (
            <li 
              key={item} 
              className="flex items-center text-textSecondary group-hover:text-textPrimary transition-colors duration-300"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="w-6 h-6 mr-3 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-[#F2A020]/30 transition-colors duration-300">
                <svg className="w-4 h-4 text-accent group-hover:text-[#F2A020] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
        
        {/* CTA Arrow */}
        <div className="pt-4 flex items-center text-accent group-hover:text-[#F2A020] transition-colors duration-300">
          <span className="text-sm font-semibold mr-2">Learn More</span>
          <svg 
            className={`w-5 h-5 transform transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const Services = () => {
  return (
    <div className="relative py-16 md:py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F2A020]/5 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-block mb-6">
            <span className="px-5 py-2.5 bg-[#F2A020]/10 border border-[#F2A020]/30 rounded-full text-[#F2A020] text-sm font-semibold tracking-wide uppercase">
              ✦ What We Do Best
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-black text-textPrimary mb-6 leading-tight">
            Services That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F2A020] via-accent to-accentLight">
              Drive Results
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-textSecondary max-w-3xl mx-auto leading-relaxed">
            End-to-end digital marketing solutions designed to transform your brand and accelerate growth.
          </p>
        </div>

        {/* Interactive Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {services.map((service, index) => (
            <InteractiveServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-24">
          <div className="glass-card p-10 lg:p-16 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2A020]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-textPrimary mb-6 text-center">
                Why Brands Choose Us
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {[
                  { icon: '⚡', title: 'Lightning Fast', desc: 'Rapid execution without compromising quality' },
                  { icon: '🎯', title: 'Results-Driven', desc: 'Every strategy backed by data and insights' },
                  { icon: '🤝', title: 'True Partnership', desc: 'Your success is our success' },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-textPrimary mb-2 group-hover:text-[#F2A020] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-textSecondary">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing / Packages Carousel */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-textPrimary mb-4">
              Flexible <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2A020] to-accent">Packages</span>
            </h2>
            <p className="text-lg text-textSecondary max-w-2xl mx-auto">
              Choose a plan that fits your goals — scale up as you grow.
            </p>
          </div>
          <CinematicStackedCarousel items={pricingPlans} />
        </div>

        {/* Process Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-textPrimary mb-4">
              Our Proven Process
            </h2>
            <p className="text-lg text-textSecondary max-w-2xl mx-auto">
              A systematic approach that delivers consistent, measurable results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discovery', desc: 'Deep dive into your goals, audience, and challenges', icon: '🔍' },
              { step: '02', title: 'Strategy', desc: 'Craft a custom roadmap tailored to your vision', icon: '📋' },
              { step: '03', title: 'Execution', desc: 'Bring strategies to life with precision', icon: '🚀' },
              { step: '04', title: 'Optimize', desc: 'Continuous refinement for maximum impact', icon: '📈' },
            ].map((item, i) => (
              <div 
                key={item.step} 
                className="group relative glass-card p-8 text-center hover:bg-surface/60 transition-all duration-300"
              >
                {/* Connection line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-accent/50 to-transparent" />
                )}
                
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-3xl font-heading font-bold text-accent/40 group-hover:text-[#F2A020]/60 mb-4 transition-colors duration-300">
                  {item.step}
                </div>
                <h4 className="text-xl font-heading font-bold text-textPrimary mb-3 group-hover:text-[#F2A020] transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-accent/10 border border-accent/20 text-accentLight">
              Client Stories
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-textPrimary mb-4">
              Trusted by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentLight">
                Industry Leaders
              </span>
            </h2>
            <p className="text-textSecondary max-w-xl mx-auto text-lg">
              Real results from real partnerships — hear directly from the brands we've helped grow.
            </p>
          </div>

          {/* Glow backdrop */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.id} t={t} featured={i === 0} />
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FAQ />

        {/* CTA Section */}
        <div className="mt-24 relative">
          <div className="glass-card p-12 lg:p-16 rounded-3xl text-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F2A020]/10 via-accent/10 to-accentLight/10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2A020]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-5xl lg:text-6xl mb-6">🚀</div>
              <h3 className="text-3xl lg:text-5xl font-heading font-bold text-textPrimary mb-4">
                Ready to Make It Happen?
              </h3>
              <p className="text-lg lg:text-xl text-textSecondary mb-8 max-w-2xl mx-auto">
                Let's turn your vision into reality. Book a free consultation and discover how we can accelerate your growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/contact" 
                  className="group relative px-8 py-4 bg-[#F2A020] hover:bg-[#E89018] text-[#0B1120] font-bold text-lg rounded-lg transition-all duration-300 shadow-lg shadow-[#F2A020]/25 hover:shadow-xl hover:shadow-[#F2A020]/40 hover:scale-105"
                >
                  <span className="relative z-10">Start Your Project</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#F2A020] to-[#FF8800] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link 
                  to="/work" 
                  className="px-8 py-4 bg-transparent hover:bg-[#F2A020]/10 text-textPrimary hover:text-[#F2A020] font-bold text-lg rounded-lg border-2 border-[#F2A020]/40 hover:border-[#F2A020] transition-all duration-300"
                >
                  View Case Studies →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services
