'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'kh'

interface LanguageContextType {
  lang: Language
  toggleLang: () => void
  t: (key: string) => string
}

const translations: Record<string, Record<Language, string>> = {

  // ── NAVBAR ──
  'nav.browse': { en: 'Browse', kh: 'រុករក' },
  'nav.categories': { en: 'Categories', kh: 'ប្រភេទ' },
  'nav.about': { en: 'About', kh: 'អំពីយើង' },
  'nav.signin': { en: 'Sign In', kh: 'ចូល' },
  'nav.register': { en: 'Register', kh: 'ចុះឈ្មោះ' },
  'nav.signout': { en: 'Sign Out', kh: 'ចាកចេញ' },
  'nav.dashboard': { en: 'Dashboard', kh: 'ផ្ទាំងគ្រប់គ្រង' },
  'nav.admin': { en: 'Admin Panel', kh: 'គ្រប់គ្រង' },
  'nav.ranks': { en: 'Ranks', kh: 'ថ្នាក់' },
  'nav.back_store': { en: 'Back to Store', kh: 'ត្រឡប់ទៅហាង' },
  'nav.my_account': { en: 'My Account', kh: 'គណនីខ្ញុំ' },

  // ── HOMEPAGE ──
  'home.badge': { en: "Cambodia's Premium Marketplace", kh: 'ទីផ្សារល្អឥតខ្ចោះនៃកម្ពុជា' },
  'home.headline1': { en: 'Discover', kh: 'រកឃើញ' },
  'home.headline2': { en: 'Premium Products', kh: 'ផលិតផលល្អ' },
  'home.headline3': { en: 'From Local Sellers', kh: 'ពីអ្នកលក់មូលដ្ឋាន' },
  'home.search': { en: 'Search products...', kh: 'ស្វែងរកផលិតផល...' },
  'home.searchbtn': { en: 'Search', kh: 'ស្វែងរក' },
  'home.featured': { en: 'Featured Products', kh: 'ផលិតផលពិសេស' },
  'home.all_products': { en: 'All Products', kh: 'ផលិតផលទាំងអស់' },
  'home.premium_spotlight': { en: 'Featured Spotlight', kh: 'អ្នកលក់ពិសេស' },
  'home.premium_sellers': { en: 'PREMIUM SELLERS', kh: 'អ្នកលក់ពិសេស' },
  'home.top_sellers': { en: 'TOP SELLERS', kh: 'អ្នកលក់កំពូល' },
  'home.new_sellers': { en: 'NEW SELLERS', kh: 'អ្នកលក់ថ្មី' },
  'home.just_started': { en: 'Just Getting Started 🥉', kh: 'អ្នកលក់ថ្មី 🥉' },
  'home.no_products': { en: 'No products yet', kh: 'មិនមានផលិតផលទេ' },
  'home.view_shop': { en: 'View Shop →', kh: 'មើលហាង →' },
  'home.products_listed': { en: 'products listed', kh: 'ផលិតផល' },
  'home.loading': { en: 'Loading products...', kh: 'កំពុងផ្ទុក...' },

  // ── BROWSE ──
  'browse.title': { en: 'Browse Products', kh: 'រុករកផលិតផល' },
  'browse.search': { en: 'Search products...', kh: 'ស្វែងរកផលិតផល...' },
  'browse.all': { en: 'All', kh: 'ទាំងអស់' },
  'browse.sort_newest': { en: 'Newest', kh: 'ថ្មីជាងគេ' },
  'browse.sort_low': { en: 'Price: Low to High', kh: 'តម្លៃ: ទាប → ខ្ពស់' },
  'browse.sort_high': { en: 'Price: High to Low', kh: 'តម្លៃ: ខ្ពស់ → ទាប' },
  'browse.no_products': { en: 'No products found', kh: 'រកមិនឃើញផលិតផល' },
  'browse.filters': { en: 'Filters', kh: 'តម្រង' },
  'browse.categories': { en: 'Categories', kh: 'ប្រភេទ' },
  'browse.sort_by': { en: 'Sort By', kh: 'តម្រៀបតាម' },
  'browse.results': { en: 'products found', kh: 'ផលិតផលត្រូវបានរកឃើញ' },

  // ── PRODUCT DETAIL ──
  'product.back': { en: '← Back to Store', kh: '← ត្រឡប់ទៅហាង' },
  'product.seller': { en: 'Seller', kh: 'អ្នកលក់' },
  'product.category': { en: 'Category', kh: 'ប្រភេទ' },
  'product.stock': { en: 'In Stock', kh: 'នៅក្នុងស្តុក' },
  'product.out_of_stock': { en: 'Out of Stock', kh: 'អស់ស្តុក' },
  'product.low_stock': { en: 'Only {n} left!', kh: 'នៅសល់ {n} ទៀត!' },
  'product.description': { en: 'Description', kh: 'ការពិពណ៌នា' },
  'product.contact': { en: 'Contact Seller', kh: 'ទំនាក់ទំនងអ្នកលក់' },
  'product.whatsapp': { en: 'WhatsApp', kh: 'វ៉ូតសអាប' },
  'product.telegram': { en: 'Telegram', kh: 'តេឡេក្រាម' },
  'product.facebook': { en: 'Facebook', kh: 'ហ្វេសប៊ុក' },
  'product.phone': { en: 'Call', kh: 'ទូរស័ព្ទ' },
  'product.trusted': { en: 'This seller is trusted and verified by NestKH', kh: 'អ្នកលក់នេះត្រូវបានផ្ទៀងផ្ទាត់ដោយ NestKH' },
  'product.premium_banner': { en: 'Premium Seller — Top rated on NestKH', kh: 'អ្នកលក់ពិសេស — ទទួលបានការវាយតម្លៃខ្ពស់' },
  'product.verified_seller': { en: 'Verified Seller ✓', kh: 'អ្នកលក់ផ្ទៀងផ្ទាត់ ✓' },
  'product.premium_seller': { en: 'Premium Seller', kh: 'អ្នកលក់ពិសេស' },
  'product.starter_seller': { en: 'Starter Seller', kh: 'អ្នកលក់ចាប់ផ្តើម' },
  'product.shop': { en: 'Visit Shop', kh: 'ចូលទៅហាង' },
  'product.loading': { en: 'Loading product...', kh: 'កំពុងផ្ទុក...' },
  'product.not_found': { en: 'Product not found', kh: 'រកមិនឃើញផលិតផល' },

  // ── SELLER SHOP PAGE ──
  'seller.products': { en: 'Products Listed', kh: 'ផលិតផលដែលបានដាក់' },
  'seller.no_products': { en: 'This seller has no products yet', kh: 'អ្នកលក់នេះមិនទាន់មានផលិតផលទេ' },
  'seller.back': { en: '← Back to Browse', kh: '← ត្រឡប់ទៅរុករក' },
  'seller.contact': { en: 'Contact', kh: 'ទំនាក់ទំនង' },
  'seller.trusted': { en: 'This seller is trusted and verified by NestKH', kh: 'អ្នកលក់នេះត្រូវបានផ្ទៀងផ្ទាត់ដោយ NestKH' },
  'seller.rank': { en: 'Rank', kh: 'ថ្នាក់' },
  'seller.status': { en: 'Status', kh: 'ស្ថានភាព' },
  'seller.trusted_badge': { en: '🛡️ Trusted Seller', kh: '🛡️ អ្នកលក់ទុកចិត្ត' },
  'seller.no_contact': { en: 'No contact info', kh: 'គ្មានព័ត៌មានទំនាក់ទំនង' },
  'seller.loading': { en: 'Loading Shop...', kh: 'កំពុងផ្ទុកហាង...' },
  'seller.not_found': { en: 'Shop not found', kh: 'រកមិនឃើញហាង' },
  'seller.premium_banner': { en: 'Premium Seller — Top rated on NestKH', kh: 'អ្នកលក់ពិសេស — ទទួលបានការវាយតម្លៃខ្ពស់' },

  // ── CATEGORIES ──
  'categories.title': { en: 'Categories', kh: 'ប្រភេទ' },
  'categories.browse': { en: 'BROWSE', kh: 'រុករក' },
  'categories.subtitle': { en: 'Shop by category', kh: 'រុករកតាមប្រភេទ' },
  'categories.products': { en: 'products', kh: 'ផលិតផល' },

  // ── ABOUT ──
  'about.badge': { en: 'Made in Cambodia', kh: 'បង្កើតនៅកម្ពុជា' },
  'about.title': { en: 'About', kh: 'អំពី' },
  'about.desc': { en: "NestKH is Cambodia's premier digital marketplace connecting trusted local sellers with buyers across the country.", kh: 'NestKH គឺជាទីផ្សារឌីជីថលកំពូលនៃកម្ពុជា ដែលភ្ជាប់អ្នកលក់ជាមួយអ្នកទិញទូទាំងប្រទេស។' },
  'about.mission': { en: 'Our Mission', kh: 'បេសកកម្មរបស់យើង' },
  'about.mission_desc': { en: 'To empower Cambodian entrepreneurs with a modern platform to grow their business online.', kh: 'ផ្តល់អំណាចដល់សហគ្រិនខ្មែរដើម្បីរីកចម្រើនអាជីវកម្មតាមអ៊ីនធឺណិត។' },
  'about.ready': { en: 'Ready to start?', kh: 'ត្រៀមខ្លួនហើយ?' },
  'about.browse_btn': { en: 'Browse Products', kh: 'រុករកផលិតផល' },
  'about.seller_btn': { en: 'Become a Seller', kh: 'ក្លាយជាអ្នកលក់' },

  // ── AUTH ──
  'auth.login_title': { en: 'Welcome Back', kh: 'សូមស្វាគមន៍មកវិញ' },
  'auth.login_sub': { en: 'Sign in to your account', kh: 'ចូលគណនីរបស់អ្នក' },
  'auth.register_title': { en: 'Create Account', kh: 'បង្កើតគណនី' },
  'auth.register_sub': { en: 'Join NestKH today', kh: 'ចូលរួម NestKH ថ្ងៃនេះ' },
  'auth.email': { en: 'Email', kh: 'អ៊ីម៉ែល' },
  'auth.password': { en: 'Password', kh: 'ពាក្យសម្ងាត់' },
  'auth.full_name': { en: 'Full Name', kh: 'ឈ្មោះពេញ' },
  'auth.login_btn': { en: 'Sign In', kh: 'ចូល' },
  'auth.register_btn': { en: 'Create Account', kh: 'បង្កើតគណនី' },
  'auth.have_account': { en: 'Already have an account?', kh: 'មានគណនីហើយ?' },
  'auth.no_account': { en: "Don't have an account?", kh: 'មិនមានគណនីទេ?' },
  'auth.buyer': { en: 'Buyer', kh: 'អ្នកទិញ' },
  'auth.seller': { en: 'Seller', kh: 'អ្នកលក់' },
  'auth.i_am': { en: 'I am a', kh: 'ខ្ញុំជា' },
  'auth.signing_in': { en: 'Signing in...', kh: 'កំពុងចូល...' },
  'auth.creating': { en: 'Creating account...', kh: 'កំពុងបង្កើតគណនី...' },

  // ── GENERAL ──
  'general.loading': { en: 'Loading...', kh: 'កំពុងផ្ទុក...' },
  'general.products': { en: 'products', kh: 'ផលិតផល' },
  'general.free': { en: 'Free', kh: 'ឥតគិតថ្លៃ' },
  'general.sold_out': { en: 'Sold Out', kh: 'អស់ហើយ' },
  'general.off': { en: 'OFF', kh: 'បញ្ចុះ' },
  'general.per_month': { en: 'per month', kh: 'ក្នុងមួយខែ' },
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
