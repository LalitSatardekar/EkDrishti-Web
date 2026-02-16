import { services } from '../data/content'

const ServiceDetailCard = ({ service, index }) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
      <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
        <div className="text-5xl mb-6">{service.icon}</div>
        <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
          {service.title}
        </h3>
        <p className="text-textSecondary text-lg leading-relaxed mb-6">
          {service.description}
        </p>
        <ul className="space-y-3">
          {['Strategic Planning', 'Implementation', 'Analytics & Optimization'].map((item) => (
            <li key={item} className="flex items-center text-textSecondary">
              <svg
                className="w-5 h-5 mr-3 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
        <div className="aspect-square rounded-2xl bg-surface flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl">{service.icon}</div>
            <p className="text-textSecondary">Service Image {index + 1}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Services = () => {
  return (
    <div className="py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            Our Services
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Comprehensive digital marketing solutions tailored to your business needs. From strategy to execution, we deliver results that matter.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-32">
          {services.map((service, index) => (
            <ServiceDetailCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-6">
              Our Process
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              A proven methodology that delivers consistent results
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals and challenges' },
              { step: '02', title: 'Strategy', desc: 'Crafting a tailored approach' },
              { step: '03', title: 'Execution', desc: 'Bringing the plan to life' },
              { step: '04', title: 'Optimization', desc: 'Continuous improvement' },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 text-center">
                <div className="text-5xl font-heading font-bold text-accent/30 mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-heading font-bold text-textPrimary mb-3">
                  {item.title}
                </h4>
                <p className="text-textSecondary">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center glass-card p-12 rounded-3xl">
          <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
            Let's Discuss Your Project
          </h3>
          <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
            Ready to take your digital marketing to the next level? Get in touch with our team.
          </p>
          <a href="/contact" className="btn-primary inline-block">
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}

export default Services
