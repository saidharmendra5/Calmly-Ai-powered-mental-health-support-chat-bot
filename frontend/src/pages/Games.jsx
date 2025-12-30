import { Gamepad2, ExternalLink, Sparkles, Zap, Brain, Palette } from 'lucide-react';
import { gameRecommendations } from '../data/mockData';
import { useState } from 'react';

const GameCard = ({ game }) => {
    return (
        <div className="group relative bg-gray-800/40 border border-gray-700/50 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1 flex flex-col md:flex-row h-full md:h-56">

            {/* Game Thumbnail */}
            <div className="relative w-full md:w-64 flex-shrink-0 h-48 md:h-full overflow-hidden bg-gray-800">
                <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900/50" />

                {/* Play Overlay (Visible on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <ExternalLink className="w-5 h-5 text-purple-600 ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {game.title}
                        </h3>
                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                            {game.category}
                        </span>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                        {game.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {game.tags.map(tag => (
                            <span key={tag} className="text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between mt-auto">
                    <a
                        href={game.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-gray-700/50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center space-x-2 group/btn"
                    >
                        <Gamepad2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span>Play Now</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

const Games = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Logic & Focus', 'Creativity & Art', 'Visual Therapy', 'Fun & Distraction'];

    const filteredGames = selectedCategory === 'All'
        ? gameRecommendations
        : gameRecommendations.filter(g => g.category === selectedCategory);

    return (
        <div className="h-full bg-gray-900 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Relaxation Arcade
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Distraction is a valid coping mechanism. These curated, ad-lite experiences are designed to help you find your flow state and ground yourself.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide space-x-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Games Grid */}
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {filteredGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>

                {/* Footer Note */}
                <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/30 flex items-start space-x-4">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">A Note on External Games</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            These games are hosted on external websites. While we carefully select them for quality,
                            we cannot control ads or changes to their content. If a game becomes stressful or broken,
                            simply close the tab and return here.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Games;