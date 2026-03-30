/**
 * Mind Map Configuration for Service Pages
 * Defines service items and their positions for each service page
 */

export const mindMapConfigs = {
  events: {
    centerText: 'WE MANAGE',
    services: [
      { id: 1, label: 'CORPORATE EVENTS', position: { x: -35, y: -25 } },
      { id: 2, label: 'WEDDINGS', position: { x: 38, y: -12 } },
      { id: 3, label: 'SPORTS', position: { x: 38, y: 18 } },
      { id: 4, label: 'BIRTHDAYS', position: { x: 22, y: 38 } },
      { id: 5, label: 'CONCERTS', position: { x: -22, y: 35 } },
      { id: 6, label: 'SMALL FAMILY EVENTS', position: { x: -40, y: 8 } },
      { id: 7, label: 'POOJAS', position: { x: -18, y: -38 } },
      { id: 8, label: 'PARTIES', position: { x: 5, y: -42 } },
    ],
  },
  digitalMarketing: {
    centerText: 'WE MANAGE',
    services: [
      { id: 1, label: 'SOCIAL MEDIA MARKETING', position: { x: -40, y: -20 } },
      { id: 2, label: 'SEO & SEM', position: { x: -38, y: 12 } },
      { id: 3, label: 'EMAIL MARKETING', position: { x: -16, y: 40 } },
      { id: 4, label: 'WHATSAPP MARKETING', position: { x: 32, y: 28 } },
      { id: 5, label: 'GMB OPTIMIZATION', position: { x: 40, y: -8 } },
      { id: 6, label: 'PERFORMANCE MARKETING', position: { x: 28, y: -28 } },
      { id: 7, label: 'INFLUENCER MARKETING', position: { x: -18, y: -40 } },
      { id: 8, label: 'STRATEGIC BRAND BUILDING', position: { x: 8, y: 40 } },
      { id: 9, label: 'CONTENT CREATION', position: { x: 5, y: -42 } },
    ],
  },
  production: {
    centerText: 'WE MANAGE',
    services: [
      { id: 1, label: 'PHOTOGRAPHY', position: { x: -35, y: -20 } },
      { id: 2, label: 'VIDEOGRAPHY', position: { x: 35, y: -18 } },
      { id: 3, label: 'CINEMATOGRAPHY', position: { x: 38, y: 10 } },
      { id: 4, label: 'AUDIO PRODUCTION', position: { x: 20, y: 35 } },
      { id: 5, label: 'GRAPHIC DESIGNING', position: { x: -25, y: 32 } },
      { id: 6, label: 'PRINTING SERVICES', position: { x: -38, y: 5 } },
    ],
  },
}

/**
 * Get configuration for a specific service page
 * @param {string} serviceType - 'events', 'digitalMarketing', or 'production'
 * @returns {Object} Configuration object with centerText and services
 */
export const getMindMapConfig = (serviceType) => {
  return mindMapConfigs[serviceType] || mindMapConfigs.events
}

// Made with Bob
