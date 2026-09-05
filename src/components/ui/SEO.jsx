import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title = 'Ekdrishti Studios - Premium Digital Marketing & Event Photography',
  description = 'Transform your brand with strategic digital marketing, stunning event photography, and professional production services. Capturing moments that matter.',
  keywords = 'digital marketing, event photography, brand strategy, wedding photography, corporate events, production services',
  image = '/logo.png',
  url = 'https://ekdrishti.com',
  type = 'website',
  schema = null
}) => {
  const fullTitle = title.includes('Ekdrishti') ? title : `${title} | Ekdrishti Studios`

  // 1. Organization Schema Configuration
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ekdrishti Studios",
    "url": "https://ekdrishti.com",
    "logo": "https://ekdrishti.com/logo.png",
    "sameAs": [
      "https://www.instagram.com/ekdrishti",
      "https://www.linkedin.com/company/ekdrishti"
    ]
  }

  // 2. WebPage Schema Configuration
  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "description": description,
    "url": url
  }

  // Choose schema to output
  const activeSchema = schema || (type === 'website' || url === 'https://ekdrishti.com' || url === 'https://ekdrishti.com/' ? orgSchema : webpageSchema)
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  )
}

export default SEO
