'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'kh'

interface LanguageContextType {
  lang: Language
  toggleLang: () => void
  t: (key: string) => string
}

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  'nav.browse': { en: 'Browse', kh: 'រុករក' },
  'nav.categories': { en: 'Categories', kh: 'ប្រភេទ' },
  'nav.about': { en: 'About', kh: 'អំពី' },
  'nav.signin': { en: 'Sign In', kh: 'ចូល' },
  'nav.register': { en: 'Register', kh: 'ចុះឈ្មោះ' },
  'nav.signout': { en: 'Sign Out', kh: 'ចាកចេញ' },
  'nav.dashboard': { en: 'Dashboard', kh: 'ផ្ទាំងគ្រប់គ្រង' },

  // Homepage
  'home.badge': { en: 'Cambodia\'s Premium Marketplace', kh: 'ទីផ្សារល្អឥតខ្ចោះនៃកម្ពុជា' },
  'home.headline1': { en: 'Discover', kh: 'រកឃើញ' },
  'home.headline2': { en: 'Premium Products', kh: 'ផលិតផលពិសេស' },
  'home.headline3': { en: 'From Local Sellers', kh: 'ពីអ្នកលក់មូលដ្ឋាន' },
  'home.search': { en: 'Search products...', kh: 'ស្វែងរកផលិតផល...' },
  'home.searchbtn': { en: 'Search', kh: 'ស្វែងរក' },
  'home.featured': { en: 'Featured Products', kh: 'ផលិតផលពិសេស' },
  'home.premium_sellers': { en: 'Featured Spotlight', kh: 'អ្នកលក់ពិសេស' },
  'home.top_sellers': { en: 'Top Sellers', kh: 'អ្នកលក់កំពូល' },
  'home.new_sellers': { en: 'Just Getting Started', kh: 'អ្នកលក់ថ្មី' },
  'home.no_products': { en: 'No products yet', kh: 'មិនមានផលិតផលទេ' },
  'home.view_all': { en: 'View All Products', kh: 'មើលផលិតផលទាំងអស់' },

  // Browse
  'browse.title': { en: 'Browse Products', kh: 'រុករកផលិតផល' },
  'browse.filter': { en: 'Filter', kh: 'តម្រង' },
  'browse.sort': { en: 'Sort by', kh: 'តម្រៀបតាម' },
  'browse.all': { en: 'All', kh: 'ទាំងអស់' },
  'browse.newest': { en: 'Newest', kh: 'ថ្មីជាងគេ' },
  'browse.price_low': { en: 'Price: Low to High', kh: 'តម្លៃ: ទាបទៅខ្ពស់' },
  'browse.price_high': { en: 'Price: High to Low', kh: 'តម្លៃ: ខ្ពស់ទៅទាប' },
  'browse.no_products': { en: 'No products found', kh: 'រកមិនឃើញផលិតផល' },

  // Product detail
  'product.seller': { en: 'Seller', kh: 'អ្នកលក់' },
  'product.category': { en: 'Category', kh: 'ប្រភេទ' },
  'product.price': { en: 'Price', kh: 'តម្លៃ' },
  'product.stock': { en: 'In Stock', kh: 'នៅក្នុងស្តុក' },
  'product.description': { en: 'Description', kh: 'ការពិពណ៌នា' },
  'product.contact': { en: 'Contact Seller', kh: 'ទំនាក់ទំនងអ្នកលក់' },
  'product.trusted': { en: 'This seller is trusted and verified by NestKH', kh: 'អ្នកលក់នេះត្រូវបានផ្ទៀងផ្ទាត់ដោយ NestKH' },
  'product.back': { en: '← Back to Store', kh: '← ត្រឡប់ទៅហាង' },
  'product.premium_banner': { en: 'Premium Seller — Top rated on NestKH', kh: 'អ្នកលក់ពិសេស — ទទួលបានការវាយតម្លៃខ្ពស់' },

  // Categories
  'categories.title': { en: 'Categories', kh: 'ប្រភេទ' },
  'categories.browse': { en: 'BROWSE', kh: 'រុករក' },
  'categories.products': { en: 'products', kh: 'ផលិតផល' },

  // About
  'about.badge': { en: 'Made in Cambodia', kh: 'បង្កើតនៅកម្ពុជា' },
  'about.title': { en: 'About NestKH', kh: 'អំពី NestKH' },
  'about.desc': { en: 'NestKH is Cambodia\'s premier digital marketplace connecting trusted local sellers with buyers across the country.', kh: 'NestKH គឺជាទីផ្សារឌីជីថលកំពូលនៃកម្ពុជា ដែលភ្ជាប់អ្នកលក់ក្នុងស្រុកជាមួយអ្នកទិញទូទាំងប្រទេស។' },
  'about.ready': { en: 'Ready to start?', kh: 'ត្រៀមខ្លួនហើយ?' },
  'about.browse_btn': { en: 'Browse Products', kh: 'រុករកផលិតផល' },
  'about.seller_btn': { en: 'Become a Seller', kh: 'ក្លាយជាអ្នកលក់' },

  // Auth
  'auth.login_title': { en: 'Welcome Back', kh: 'សូមស្វាគមន៍មកវិញ' },
  'auth.register_title': { en: 'Create Account', kh: 'បង្កើតគណនី' },
  'auth.email': { en: 'Email', kh: 'អ៊ីម៉ែល' },
  'auth.password': { en: 'Password', kh: 'ពាក្យសម្ងាត់' },
  'auth.login_btn': { en: 'Sign In', kh: 'ចូល' },
  'auth.register_btn': { en: 'Create Account', kh: 'បង្កើតគណនី' },
  'auth.have_account': { en: 'Already have an account?', kh: 'មានគណនីហើយ?' },
  'auth.no_account': { en: 'Don\'t have an account?', kh: 'មិនមានគណនីទេ?' },
  'auth.buyer': { en: 'Buyer', kh: 'អ្នកទិញ' },
  'auth.seller': { en: 'Seller', kh: 'អ្នកលក់' },

  // Ranks page
  'ranks.badge': { en: 'SELLER RANKS', kh: 'ថ្នាក់អ្នកលក់' },
  'ranks.title': { en: 'Boost Your Shop 🚀', kh: 'លើកកម្ពស់ហាងរបស់អ្នក 🚀' },
  'ranks.subtitle': { en: 'Get a rank badge and make your products stand out', kh: 'ទទួលបានបាដហ្ស​ ហើយធ្វើឲ្យផលិតផលរបស់អ្នកលេចធ្លោ' },

  // General
  'general.products': { en: 'products', kh: 'ផលិឤផल' },
  'general.view_shop': { en: 'View Shop →', kh: 'មើលហាង →' },
  'general.loading': { en: 'Loading...', kh: 'កំពុងផ្ទុក...' },
  'general.back_store': { en: '← Back to Store', kh: '← ត្រឡប់ទៅហាង' },
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('nestkh-lang') as Language
    if (saved === 'en' || saved === 'kh') setLang(saved)
  }, [])

  function toggleLang() {
    const newLang = lang === 'en' ? 'kh' : 'en'
    setLang(newLang)
    localStorage.setItem('nestkh-lang', newLang)
  }

  function t(key: string): string {
    return translations[key]?.[lang] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
