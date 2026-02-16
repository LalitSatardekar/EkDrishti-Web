import { testimonials } from '../../data/content'

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="glass-card p-8">
      <div className="flex items-start space-x-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-accent"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <p className="text-textPrimary text-lg leading-relaxed mb-8 italic">
        "{testimonial.quote}"
      </p>
      
      <div className="flex items-center">
        <img
          src={testimonial.avatar}
          alt={testimonial.author}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div className="font-heading font-semibold text-textPrimary">
            {testimonial.author}
          </div>
          <div className="text-textSecondary text-sm">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  )
}

const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-surface/50 to-transparent">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="text-accent font-medium mb-4 block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
