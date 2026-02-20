import Hero from '../components/sections/Hero'
import ServicesPreview from '../components/sections/ServicesPreview'
import CaseStudiesPreview from '../components/sections/CaseStudiesPreview'
import Testimonials from '../components/sections/Testimonials'
import CTABand from '../components/sections/CTABand'
import CinematicStackedCarousel from '../components/packages/CinematicStackedCarousel'
import { pricingPlans } from '../data/content'

const Home = () => {
  return (
    <>
      <Hero />
      <ServicesPreview />

      {/* Packages Carousel */}
      <section className="py-16 overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-textPrimary mb-3">Our Packages</h2>
            <p className="text-textSecondary max-w-xl mx-auto text-sm">Choose a plan that fits your goals — upgrade anytime.</p>
          </div>
          <CinematicStackedCarousel items={pricingPlans} />
        </div>
      </section>

      <CaseStudiesPreview />
      <Testimonials />
      <CTABand />
    </>
  )
}

export default Home
