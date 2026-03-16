import Link from 'next/link'

export default function Footer() {
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-6 sm:py-10 mt-10 sm:mt-15">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
        <div className="text-gray-500 text-sm">
          © 2026 NestKH. All rights reserved.
        </div>
        
        <div className="flex gap-6">
          <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
