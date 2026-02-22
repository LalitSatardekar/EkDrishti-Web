import { services } from '../../data/content'

const ServiceCard = ({ service }) => {
  return (
    <div className="group glass-card p-6 lg:p-8 hover:-translate-y-2 transition-all duration-300 cursor-pointer border-borderSubtle hover:border-amber-500/30 hover:shadow-[0_0_28px_rgba(245,158,11,0.10)]">
      <div className="text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-textPrimary mb-3 group-hover:text-amber-400 transition-colors duration-300">
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-surface/50">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-amber-400 font-medium mb-4 block">What We Do</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-textPrimary mb-4 md:mb-6">
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
          <a href="/#packages" className="btn-primary inline-block">
            Explore All Services
          </a>
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview
