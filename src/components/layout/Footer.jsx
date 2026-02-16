import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Work', path: '/work' },
        { name: 'Services', path: '/services' },
        { name: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Brand Strategy', path: '/services' },
        { name: 'Digital Marketing', path: '/services' },
        { name: 'Content Creation', path: '/services' },
        { name: 'Social Media', path: '/services' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { name: 'LinkedIn', path: '#', external: true },
        { name: 'Twitter', path: '#', external: true },
        { name: 'Instagram', path: '#', external: true },
        { name: 'Facebook', path: '#', external: true },
      ],
    },
  ]

  return (
    <footer className="bg-surface border-t border-borderSubtle">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/logo.png" 
                alt="Ekdrishti" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-textSecondary mb-4 max-w-sm">
              Transforming brands through strategic digital marketing and creative excellence.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold text-textPrimary mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-textSecondary hover:text-accent transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-textSecondary hover:text-accent transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-borderSubtle">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-textSecondary text-sm">
              © {currentYear} Ekdrishti. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                to="#"
                className="text-textSecondary hover:text-accent transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-textSecondary hover:text-accent transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
