import SEO from '../components/ui/SEO'
import Hero from '../components/sections/Hero'
import ServicesPreview from '../components/sections/ServicesPreview'
import CaseStudiesPreview from '../components/sections/CaseStudiesPreview'
import Testimonials from '../components/sections/Testimonials'
import CTABand from '../components/sections/CTABand'
export default function Home() {
  return <>
    <SEO title="Ekdrishti Studios - Premium Digital Marketing & Event Photography" description="Transform your brand with strategic digital marketing, stunning event photography, and professional production services. Capturing moments that matter." keywords="digital marketing, event photography, brand strategy, wedding photography, corporate events, production services" />
    <Hero /><CaseStudiesPreview /><ServicesPreview /><Testimonials /><CTABand />
  </>
}
