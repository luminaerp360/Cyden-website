import { Branch, Milestone, DistributionRoute } from '../types';

export const COMPANY_INFO = {
  name: 'Cyden Distributors Limited',
  shortName: 'Cyden Distributors',
  taglines: [
    'Discover the finest Gin',
    'Crafted Heritage in Every Kenyan Beer',
    'World-Class Scotch Whisky & Single Malts',
    'Pure Smoothness in Premium Vodka & Rums'
  ],
  foundedYear: 2013,
  expansionYear: 2019,
  recognition: 'EABL Gold Distributor (2024)',
  principalSupplier: 'East African Breweries Limited (EABL)',
  outletsCount: '600+',
  coverageCounties: ['Uasin Gishu', 'Elgeyo Marakwet', 'Nandi County'],
  mission: 'To be the best EABL distributor in Kenya, by putting focus on our customer and ensuring optimal service delivery within our area of operations.',
  vision: 'To be the number one FMCG Distributor delivering first-class processes and profit growth.',
  story: `Cyden Distributors Limited was founded in 2013 with a vision to provide exceptional distribution services in Kenya. Starting as a small operation, the company quickly gained a reputation for reliability and innovation in the distribution industry. In 2019, recognizing growing demand for high-quality distribution services, the company reinstated and expanded operations. Cyden now has a strong presence in Uasin Gishu, Elgeyo Marakwet, and parts of Nandi County, serving over 600 outlets.`,
  contact: {
    primaryPhone: '+254 722 400 409',
    primaryPhoneRaw: '+254722400409',
    secondaryPhone: '+254 754 722 746',
    email: 'info@cydendistributors.co.ke',
    address: 'Rupa Godowns, P.O Box 1629-30100, Eldoret, Kenya',
    town: 'Eldoret',
    country: 'Kenya',
  },
  socials: {
    instagram: 'https://www.instagram.com/cydendistributors',
    twitter: 'https://x.com/CydenDistribut1',
    facebook: 'https://www.facebook.com/profile.php?id=100070853436866',
    tiktok: 'https://vm.tiktok.com/ZMBo92seD/',
  },
  financialPartners: [
    { name: 'Absa Bank', role: 'Financial Services Support (Since 2021)' },
    { name: 'Equity Bank', role: 'Retail Financing Collaboration' },
    { name: 'KCB Bank', role: 'Retailer Credit Partner' },
    { name: 'Kuza', role: 'Trade Credit Facility' },
    { name: 'Solve Kenya', role: 'Supply Chain Financing' }
  ]
};

export const BRANCHES: Branch[] = [
  {
    id: 'branch-eldoret-main',
    name: 'Main Office & Central Warehouse',
    type: 'Main Office',
    address: 'Rupa Godowns, Malaba / Uganda Road Industrial Area, P.O Box 1629-30100, Eldoret',
    county: 'Uasin Gishu County',
    phone: '+254722400409',
    phoneDisplay: '0722 400 409',
    operatingHours: 'Open Everyday: 7:30 AM – 8:30 PM',
    description: 'Central distribution headquarters and heavy logistics warehouse housing comprehensive EABL portfolio inventory with dedicated cold chain bays and delivery fleet staging.',
    coordinates: { lat: 0.515, lng: 35.288333 },
    coordinatesDisplay: '0°30\'54"N, 35°17\'18"E (0.5150° N, 35.2883° E)',
    landmarks: [
      'Rupa Mills & Godowns Complex',
      'Off Uganda Road / Malaba Road, Kapsoya & Eastern Ave Corridor',
      'Near Rupa\'s Mall Industrial Sector, Eldoret'
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=0.515000,35.288333+(Cyden+Distributors+Limited+-+Rupa+Godowns+Eldoret)&t=&z=16&ie=UTF8&iwloc=B&output=embed',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=0.515000,35.288333',
    googleMapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=0.515000,35.288333',
  },
  {
    id: 'branch-iten-substore',
    name: 'Iten Sub-Store & Depository',
    type: 'Sub-Store',
    address: 'Sitet Building, Iten Town Center, Iten-Kabarnet Road (C51)',
    county: 'Elgeyo Marakwet County',
    phone: '+254754722746',
    phoneDisplay: '0754 722 746',
    operatingHours: 'Open Everyday: 8:00 AM – 8:30 PM',
    description: 'Highland distribution sub-depot serving retail accounts, hotels, and tourist lounges across Iten township and the Kerio Valley escarpment rim with rapid weekly replenishment.',
    coordinates: { lat: 0.6732, lng: 35.5085 },
    coordinatesDisplay: '0°40\'23"N, 35°30\'30"E (0.6732° N, 35.5085° E)',
    landmarks: [
      'Sitet Building, Iten Town Center',
      'Along Eldoret-Iten-Kabarnet Highway (C51)',
      'Home of Champions Escarpment Hub'
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=0.673200,35.508500+(Cyden+Distributors+-+Iten+Sub-Store+Sitet+Building)&t=&z=16&ie=UTF8&iwloc=B&output=embed',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=0.673200,35.508500',
    googleMapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=0.673200,35.508500',
  }
];

export const MILESTONES: Milestone[] = [
  {
    year: '2013',
    title: 'Foundation of Cyden',
    description: 'Company founded with a steadfast vision to deliver exceptional, reliable beverage distribution services in Kenya.',
  },
  {
    year: '2019',
    title: 'Reinstatement & Strategic Expansion',
    description: 'Reinstated and significantly expanded operations with modernized fleet management and scaled warehouse facilities.',
  },
  {
    year: '2019–2020',
    title: 'Regional Market Expansion (600+ Outlets)',
    description: 'Broadened supply coverage across Uasin Gishu, Elgeyo Marakwet, and Nandi County, achieving a network milestone of over 600 retail and hospitality outlets.',
  },
  {
    year: '2021',
    title: 'Absa Bank Financial Partnership',
    description: 'Formed strategic corporate alliance with Absa Bank for commercial credit lines and enhanced working capital distribution solutions.',
  },
  {
    year: '2022',
    title: 'Technology Integration in Logistics',
    description: 'Implemented modern digital inventory dispatch, GPS route optimization, and digital delivery confirmation to eliminate retail stockouts.',
  },
  {
    year: '2022',
    title: 'Retail Financing Consortium',
    description: 'Collaborated with Kuza, Equity Bank, KCB Bank, and Solve Kenya to provide flexible retailer inventory financing, empowering bar owners to scale up.',
  },
  {
    year: '2023',
    title: 'Leading EABL Distributor Recognition',
    description: 'Officially recognized by East African Breweries Limited as one of the Leading Distributors in Kenya for operational excellence.',
  },
  {
    year: '2024',
    title: 'EABL Gold Distributor Award',
    description: 'Conferred the prestigious Gold Distributor distinction by EABL for outstanding sales volume, retail partner satisfaction, and exemplary supply chain standards.',
    highlight: true,
    badgeText: 'Gold Distinction',
  },
  {
    year: '2025',
    title: 'RTM Optimization & Premiumization',
    description: 'Core Route-to-Market (RTM) enhancement to guarantee strict stock availability and aggressive execution of portfolio premiumization to capture high-value market segments across all distribution nodes.',
    details: [
      {
        label: 'Focus',
        value: 'Core Route-to-Market (RTM) enhancement to guarantee strict stock availability.'
      },
      {
        label: 'Strategy',
        value: 'Aggressive execution of portfolio premiumization to capture high-value market segments across all distribution nodes.'
      }
    ]
  },
  {
    year: '2026',
    title: 'Record Commercial Growth (FY 2025/2026)',
    description: 'Achieved a historic record turnover and premier volume milestone across the regional distribution network, anchored by the transition to sustainable logistics and optimized green fleet frameworks.',
    highlight: true,
    badgeText: 'Record Revenue Milestone',
    details: [
      {
        label: 'Achievement',
        value: 'Successfully achieved a historic record turnover milestone, solidifying regional market leadership.'
      },
      {
        label: 'Operational Backbone',
        value: 'Anchored by the successful transition to sustainable logistics and optimized green fleet frameworks initiated early in the year.'
      }
    ]
  },
  {
    year: '2027',
    title: 'Digital Acceleration & Next-Level Scaling (FY 2026/2027)',
    description: 'Aggressive commercial drive to expand regional market reach and trade velocity by scaling online visibility, integrating advanced B2B marketplace options, and driving digital client acquisition channels.',
    highlight: true,
    badgeText: 'Market Expansion Target',
    details: [
      {
        label: 'Target',
        value: 'Aggressive commercial drive to maximize market footprint and accelerate high-volume distribution.'
      },
      {
        label: 'Strategy',
        value: 'Scaling online visibility, integrating advanced B2B marketplace options, and driving digital client acquisition channels.'
      }
    ]
  }
];

export const BRANDS = [
  { name: 'Tusker', category: 'Beer', logoText: 'TUSKER', color: '#DEAB09', desc: 'Brewed with 100% African Ingredients' },
  { name: 'Guinness', category: 'Stout', logoText: 'GUINNESS', color: '#C69214', desc: 'Extra Stout & Smooth' },
  { name: 'White Cap', category: 'Beer', logoText: 'WHITE CAP', color: '#1B3E6F', desc: 'Clean, Crisp Mountain Brew' },
  { name: 'Johnnie Walker', category: 'Whisky', logoText: 'JOHNNIE WALKER', color: '#9B2C2C', desc: 'Keep Walking' },
  { name: 'Smirnoff', category: 'Vodka', logoText: 'SMIRNOFF', color: '#B91C1C', desc: 'Triple Distilled Purity' },
  { name: 'Gilbeys', category: 'Gin', logoText: 'GILBEY’S', color: '#047857', desc: 'Special Dry Botanical Gin' },
  { name: 'Gordons', category: 'Gin', logoText: 'GORDON’S', color: '#D97706', desc: 'London Dry Gin Heritage' },
  { name: 'Captain Morgan', category: 'Rum', logoText: 'CAPTAIN MORGAN', color: '#9A3412', desc: 'Spice & Oak-Aged Dark Rum' },
  { name: 'Tanqueray', category: 'Gin', logoText: 'TANQUERAY', color: '#065F46', desc: 'Fresh Citrus Botanicals' },
  { name: 'Baileys', category: 'Liquor', logoText: 'BAILEYS', color: '#78350F', desc: 'Original Irish Cream' },
];

export const DISTRIBUTION_ROUTES: DistributionRoute[] = [
  {
    id: 'route-kso',
    route: 'Key Strategic Outlet (KSO)',
    phoneNumber: '0740 631 373',
    phoneRaw: '+254740631373',
    tillNumber: '4225308',
    site: 'Dedicated delivery dispatch, fleet logistics coordination, and key account desk for Key Strategic Outlets (KSO)',
    category: 'support',
    categoryLabel: 'Support & KSO',
    waypoints: ['Key Accounts', 'Priority Dispatch', 'Order Fulfillment'],
    vehicleType: 'Dedicated KSO Fleet',
  },
  {
    id: 'route-su-support',
    route: 'SU (Support Unit)',
    phoneNumber: '0740 631 345',
    phoneRaw: '+254740631345',
    site: 'Central customer care, billing inquiries, and account escalation support',
    category: 'support',
    categoryLabel: 'Customer Support',
    waypoints: ['Account Onboarding', 'Credit Support', 'Customer Care Desk'],
    vehicleType: 'Central Hotline Desk',
  },
  {
    id: 'route-town',
    route: 'Town',
    phoneNumber: '0740 631 030',
    phoneRaw: '+254740631030',
    tillNumber: '5891085',
    site: 'Town – Kimumu – Chepkanga via Munyaka, Sogomo through Marura',
    category: 'core_route',
    categoryLabel: 'Core Route',
    waypoints: ['Eldoret CBD', 'Kimumu', 'Chepkanga', 'Munyaka', 'Sogomo', 'Marura'],
    vehicleType: 'Primary Route Truck',
  },
  {
    id: 'route-langas',
    route: 'Langas',
    phoneNumber: '0740 631 039',
    phoneRaw: '+254740631039',
    tillNumber: '5891083',
    site: 'Pioneer – Elgon View – Langas – Kapseret via Kisumu Ndogo corner',
    category: 'core_route',
    categoryLabel: 'Core Route',
    waypoints: ['Pioneer', 'Elgon View', 'Langas', 'Kapseret', 'Kisumu Ndogo'],
    vehicleType: 'Primary Route Truck',
  },
  {
    id: 'route-van-a',
    route: 'Van A',
    phoneNumber: '0740 631 102',
    phoneRaw: '+254740631102',
    tillNumber: '324357',
    site: 'Eldoret CBD – Langas (Exclusively UDV Spirits Van)',
    category: 'van',
    categoryLabel: 'UDV Spirits Van',
    waypoints: ['Eldoret CBD', 'Langas'],
    vehicleType: 'Dedicated UDV Spirits Van',
  },
  {
    id: 'route-van-b',
    route: 'Van B',
    phoneNumber: '0740 631 144',
    phoneRaw: '+254740631144',
    tillNumber: '324358',
    site: 'Annex, Rupa environs, Kipkorgot, Kimumu, Chep junction to Marura (Exclusively UDV Van)',
    category: 'van',
    categoryLabel: 'UDV Spirits Van',
    waypoints: ['Annex', 'Rupa Environs', 'Kipkorgot', 'Kimumu', 'Chep Junction', 'Marura'],
    vehicleType: 'Dedicated UDV Spirits Van',
  },
  {
    id: 'route-flax-metkei',
    route: 'Flax / Metkei',
    phoneNumber: '0740 631 168',
    phoneRaw: '+254740631168',
    tillNumber: '5891087',
    site: 'Annex, Kipkorgot, Naiberi, Kaptagat, Flax, Chepkorio to Metkei via Kamwosor',
    category: 'core_route',
    categoryLabel: 'Regional Corridor',
    waypoints: ['Annex', 'Kipkorgot', 'Naiberi', 'Kaptagat', 'Flax', 'Chepkorio', 'Kamwosor', 'Metkei'],
    vehicleType: 'Heavy Highland Carrier',
  },
  {
    id: 'route-selia-kesses',
    route: 'Selia / Kesses',
    phoneNumber: '0740 631 204',
    phoneRaw: '+254740631204',
    tillNumber: '324347',
    site: 'Selia, Mosop, Kabiyet – Himaki, Nandi Hills, Lessos, Kesses, Moi University',
    category: 'core_route',
    categoryLabel: 'Regional Corridor',
    waypoints: ['Selia', 'Mosop', 'Kabiyet', 'Himaki', 'Nandi Hills', 'Lessos', 'Kesses', 'Moi University'],
    vehicleType: 'Heavy Regional Carrier',
  },
  {
    id: 'route-nandi-burnt',
    route: 'Nandi / Burnt',
    phoneNumber: '0740 631 262',
    phoneRaw: '+254740631262',
    tillNumber: '543662',
    site: 'Kapseret, Mlango, Mosoriot, Namgoi, Kapsabet & Annex, Ngeria, Cheplasgei, Cheptiret, Burnt Forest',
    category: 'core_route',
    categoryLabel: 'Regional Corridor',
    waypoints: ['Kapseret', 'Mlango', 'Mosoriot', 'Namgoi', 'Kapsabet', 'Annex', 'Ngeria', 'Cheplasgei', 'Cheptiret', 'Burnt Forest'],
    vehicleType: 'Heavy Regional Carrier',
  },
  {
    id: 'route-iten-route',
    route: 'Iten Route',
    phoneNumber: '0740 631 358',
    phoneRaw: '+254740631358',
    tillNumber: '4312064',
    site: 'Serves Iten town and environs to Kapsowar, Kapkoi, Sergoit, and Biretwo',
    category: 'core_route',
    categoryLabel: 'Regional Corridor',
    waypoints: ['Iten Town', 'Kapsowar', 'Kapkoi', 'Sergoit', 'Biretwo'],
    vehicleType: 'Highland Logistics Fleet',
  },
  {
    id: 'route-rupa-counter',
    route: 'Rupa Counter',
    phoneNumber: '0740 631 285',
    phoneRaw: '+254740631285',
    tillNumber: '992479',
    site: 'Serves walk-in customers and direct wholesale collection at Rupa Godowns, Eldoret',
    category: 'counter',
    categoryLabel: 'Depot Counter',
    waypoints: ['Rupa Godowns', 'Malaba Road Corridor', 'Eldoret Industrial Area'],
    vehicleType: 'Main Depot Walk-In Counter',
  },
  {
    id: 'route-iten-counter',
    route: 'Iten Counter',
    phoneNumber: '0740 631 290',
    phoneRaw: '+254740631290',
    tillNumber: '324296',
    site: 'Serves walk-in customers and direct collection at Iten Sub-Store (Sitet Building)',
    category: 'counter',
    categoryLabel: 'Depot Counter',
    waypoints: ['Sitet Building', 'Iten Town Centre', 'Escarpment Viewpoint'],
    vehicleType: 'Sub-Store Walk-In Counter',
  },
];
