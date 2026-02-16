import { Link } from 'react-router-dom'
import { services } from '../../data/content'

const ServiceCard = ({ service }) => {
  return (
    <div className="group glass-card p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="text-2xl font-heading font-bold text-textPrimary mb-4">
        {service.title}
      </h3>
      <p className="text-textSecondary leading-relaxed">
        {service.description}
      </p>
    </div>
  )
}

const ServicesPreview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-surface/50">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-accent font-medium mb-4 block">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary mb-6">
            Our Services
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Comprehensive digital marketing solutions designed to drive growth and maximize your brand's potential.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/services" className="btn-primary inline-block">
            Explore All Services
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview
