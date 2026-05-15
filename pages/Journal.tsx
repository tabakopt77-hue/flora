import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../constants';

export const Journal: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('Все');

    const categories = useMemo(() => {
        const cats = new Set<string>();
        BLOG_POSTS.forEach(post => {
            if (post.category) cats.add(post.category);
        });
        return ['Все', ...Array.from(cats)];
    }, []);

    const filteredPosts = useMemo(() => {
        if (activeCategory === 'Все') return BLOG_POSTS;
        return BLOG_POSTS.filter(post => post.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="container mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-12 md:pb-32">
           <Helmet><title>Блог</title></Helmet>
           <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-emerald-900 mb-4">Журнал</h2>
              <p className="text-gray-500 text-lg font-light">Истории о цветах, людях и чувствах.</p>
           </div>
           
           {/* Categories Filter */}
           <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
               {categories.map(category => (
                   <button
                       key={category}
                       onClick={() => setActiveCategory(category)}
                       className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                           activeCategory === category
                               ? 'bg-emerald-600 text-white'
                               : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                       }`}
                   >
                       {category}
                   </button>
               ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map(post => (
                 <Link to={`/blog/${post.id}`} key={post.id} className="group cursor-pointer flex flex-col h-full">
                    <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/3] shadow-sm relative">
                       {post.category && (
                           <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-emerald-800 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10">
                               {post.category}
                           </span>
                       )}
                       <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-emerald-700 mb-3 font-bold uppercase tracking-widest">
                       <span>{post.date}</span>
                       <span className="w-1 h-1 bg-emerald-300 rounded-full"></span>
                       <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors leading-tight">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center text-emerald-800 font-medium text-sm group-hover:translate-x-2 transition-transform">
                        Читать далее <ArrowRight size={16} className="ml-2" />
                    </div>
                 </Link>
              ))}
              {filteredPosts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                      В этой категории пока нет статей.
                  </div>
              )}
           </div>
        </div>
    );
};
