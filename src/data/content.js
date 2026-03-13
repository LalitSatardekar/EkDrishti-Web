export const services = [
  {
    id: 1,
    title: 'Brand Strategy',
    description: 'Comprehensive brand positioning and identity development that resonates with your target audience.',
    icon: '🎯',
  },
  {
    id: 2,
    title: 'Digital Marketing',
    description: 'Data-driven campaigns across all digital channels to maximize your ROI and brand visibility.',
    icon: '📱',
  },
  {
    id: 3,
    title: 'Content Creation',
    description: 'Compelling content that tells your brand story and engages your audience at every touchpoint.',
    icon: '✍️',
  },
  {
    id: 4,
    title: 'Social Media',
    description: 'Strategic social media management and community building to grow your online presence.',
    icon: '🚀',
  },
  {
    id: 5,
    title: 'SEO & Analytics',
    description: 'Technical SEO optimization and deep analytics to drive organic growth and insights.',
    icon: '📊',
  },
  {
    id: 6,
    title: 'Performance Marketing',
    description: 'Conversion-focused paid advertising strategies that deliver measurable business results.',
    icon: '💡',
  },
]

export const pricingPlans = [
  {/*
    id: 'starter',
    title: 'Starter',
    subtitle: 'Perfect for small businesses',
    price: '$499',
    period: '/month',
    icon: '🌱',
    description: 'Everything you need to launch your digital presence and start building brand awareness.',
    features: [
      'Brand audit & positioning',
      'Social media setup (2 channels)',
      'Monthly content calendar',
      '5 social media posts / week',
      'Basic monthly analytics report',
    ],
 */ },
 {
    id: '',
    title: 'Starter',
    subtitle: 'Perfect for small businesses',
    price: 'INR',
    period: '/',
    icon: '🌱',
    description: 'Everything you need to launch your digital presence and start building brand awareness.',
    features: [
      '',
    ],
 }
 
]

export const caseStudies = [
  {
    id: 1,
    slug: 'siddhita-kanad-wedding',
    title: 'Siddhita & Kanad',
    client: 'Siddhita & Kanad',
    category: 'Family Events',
  //  description: 'A beautiful wedding celebration captured in stunning moments.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    results: {
      metric1: 'Memorable moments captured',
      metric2: 'Professional wedding photography',
      metric3: 'Complete event coverage',
    },
    driveLinks: {
      albumGallery: 'https://drive.google.com/drive/folders/ALBUM_GALLERY_FOLDER_ID', // Public access
      video: 'https://drive.google.com/drive/folders/VIDEO_FOLDER_ID', // Public access
      allFiles: 'https://drive.google.com/drive/folders/ALL_FILES_RESTRICTED_ID', // Restricted access - client only
    },
  },
  {
    id: 2,
    slug: 'ecommerce-growth-strategy',
    title: 'E-Commerce Growth',
    client: 'LuxeWear',
    category: 'Digital Marketing',
  //  description: 'Omnichannel marketing strategy driving 5x revenue growth in 12 months.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    results: {
      metric1: '500% ROI on ad spend',
      metric2: '250K new customers acquired',
      metric3: '4.8 customer satisfaction score',
    },
  },
  {
    id: 3,
    slug: 'fintech-product-launch',
    title: 'FinTech Product Launch',
    client: 'PayFlow',
    category: 'Performance Marketing',
  //  description: 'Product launch campaign reaching 1M users in first quarter.',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
    results: {
      metric1: '1M+ app downloads',
      metric2: '65% user retention rate',
      metric3: 'Featured in top 10 finance apps',
    },
  },
]

export const testimonials = [
  {
    id: 1,
    quote: 'Working with this team transformed our entire digital presence. The results exceeded every expectation we had.',
    author: '',
    role: '',
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF?text=SC',
  },
  {
    id: 2,
    quote: 'The strategic approach and attention to detail set them apart. Our revenue grew 5x in under a year.',
    author: '',
    role: '',
    avatar: 'https://placehold.co/100x100/38BDF8/FFFFFF?text=MR',
  },
  {
    id: 3,
    quote: 'Exceptional creativity combined with data-driven execution. They truly understand modern digital marketing.',
    author: '',
    role: '',
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF?text=EW',
  },
]

export const stats = [
  { label: 'Clients Worldwide', value: '150+' },
  { label: 'Revenue Generated', value: '$--' },
  { label: 'Team Members', value: '--' },
  { label: 'Years Experience', value: '--' },
]
