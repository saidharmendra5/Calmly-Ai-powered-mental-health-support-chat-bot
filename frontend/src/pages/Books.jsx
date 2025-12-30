import { Book, ExternalLink, Heart, Star, Search, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 1. ROBUST IMAGE LOGIC: Check for both 'cover_i' (Search API) and 'cover_id' (Subject API)
  const coverId = book.cover_i || book.cover_id;

  // 2. ROBUST AUTHOR LOGIC: Check for 'author_name' (Array of strings) vs 'authors' (Array of objects)
  const getAuthorText = () => {
    if (book.author_name) return book.author_name.slice(0, 2).join(', '); // Search API format
    if (book.authors) return book.authors.map(a => a.name).slice(0, 2).join(', '); // Subject API format
    return 'Unknown Author';
  };

  const coverUrl = coverId && !imgError
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : 'https://via.placeholder.com/300x450/1f2937/6b7280?text=No+Cover';

  return (
    <div className="group relative bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1 flex flex-col md:flex-row h-full md:h-64">

      {/* Cover Image */}
      <div className="relative w-full md:w-48 flex-shrink-0 h-64 md:h-full overflow-hidden bg-gray-800">
        <img
          src={coverUrl}
          alt={book.title}
          onError={() => setImgError(true)} // Fallback if Open Library image is broken
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900/20" />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                {getAuthorText()}
              </p>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-white/5"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center space-x-1 mb-3">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-gray-300 font-medium">
              {book.ratings_average ? book.ratings_average.toFixed(1) : '4.5'}
            </span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">{book.first_publish_year || 'Classic'}</span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
            Explore this title to gain insights into wellness and mental health.
            A recommended read for your journey.
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between">
          <a
            href={`https://openlibrary.org${book.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center group/link"
          >
            <span>View Details</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>

          <button className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-white transition-colors" title="Save to Library">
            <Book className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('mental_health');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories mapped to Open Library Subjects
  const categories = [
    { label: 'Wellness', value: 'mental_health' },
    { label: 'Anxiety', value: 'anxiety' },
    { label: 'Depression', value: 'depression' },
    { label: 'Self Help', value: 'self_help' },
    { label: 'Psychology', value: 'psychology' },
    { label: 'Mindfulness', value: 'mindfulness' }
  ];

  // Fetch from Open Library API
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const subject = searchQuery ? encodeURIComponent(searchQuery) : selectedCategory;
        const url = searchQuery
          ? `https://openlibrary.org/search.json?q=${subject}&limit=12`
          : `https://openlibrary.org/subjects/${subject}.json?limit=12`;

        const response = await fetch(url);
        const data = await response.json();

        // Normalize data structure (Search API vs Subject API returns slightly different formats)
        const normalizedBooks = searchQuery
          ? data.docs
          : data.works;

        setBooks(normalizedBooks || []);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Wellness Library
            </h1>
            <p className="text-gray-400 text-lg">
              Discover millions of books to support your journey.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search specific titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filter Scroll Container */}
        <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setSearchQuery(''); // Clear search when picking a category
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat.value && !searchQuery
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-12 min-h-[400px]">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center text-gray-500 h-64">
              <Loader className="w-8 h-8 animate-spin mb-4 text-blue-400" />
              <p>Fetching from library...</p>
            </div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <BookCard key={book.key} book={book} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No books found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;