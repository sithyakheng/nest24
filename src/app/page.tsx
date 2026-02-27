export default function Home() {
  const categories = [
    { name: 'Art & Crafts', icon: '🎨' },
    { name: 'Books', icon: '📚' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Food & Beverages', icon: '🍔' },
    { name: 'Home & Living', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Vehicles', icon: '🚗' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Cambodia's Premium Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">
            Discover quality products and trusted sellers
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search for products, brands, or categories..."
                className="flex-1 px-6 py-4 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-800 hover:bg-green-900 px-8 py-4 rounded-r-lg font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-green-300"
              >
                <div className="text-4xl mb-4 text-center">{category.icon}</div>
                <h3 className="text-center font-semibold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Featured Product {i}</h3>
                  <p className="text-gray-600 text-sm mb-2">Product description goes here</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold">$99.99</span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
