
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaVk } from 'react-icons/fa';
import { BLOG_POSTS } from '../constants';
import { Button } from './Button';
import { Helmet } from 'react-helmet-async';

export const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const post = BLOG_POSTS.find(p => p.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                 <h2 className="text-2xl font-serif mb-4">Статья не найдена</h2>
                 <Button onClick={() => navigate('/blog')}>Вернуться в журнал</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
             <Helmet>
                 <title>{post.title} | Журнал</title>
             </Helmet>

             {/* Hero Image */}
             <div className="relative h-[60vh] w-full bg-gray-900 overflow-hidden">
                 <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-60 fixed-on-scroll" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                 
                 <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                     <div className="container mx-auto max-w-4xl">
                         <div className="flex flex-wrap items-center gap-6 text-emerald-200 text-sm font-medium uppercase tracking-widest mb-6">
                             <span className="flex items-center gap-2"><Calendar size={16}/> {post.date}</span>
                             <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                             <span className="flex items-center gap-2"><Clock size={16}/> {post.readTime}</span>
                         </div>
                         <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8 shadow-sm">
                             {post.title}
                         </h1>
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                                 <User size={24} />
                             </div>
                             <div>
                                 <p className="text-white font-medium text-lg">{post.author}</p>
                                 <p className="text-white/60 text-sm">Флорист-редактор</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Content */}
             <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl relative bg-white -mt-10 rounded-t-3xl shadow-xl z-10">
                 <button onClick={() => navigate('/blog')} className="flex items-center text-gray-500 hover:text-emerald-800 mb-6 md:mb-8 transition-colors">
                     <ArrowLeft size={20} className="mr-2"/> Вернуться в журнал
                 </button>

                 <div className="prose prose-lg prose-stone prose-headings:font-serif prose-a:text-emerald-700 hover:prose-a:text-emerald-900">
                     {post.content}
                 </div>

                 {/* Share & Tags */}
                 <div className="border-t border-gray-100 mt-10 md:mt-16 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="flex gap-2">
                         {['Флористика', 'Искусство', 'Тренды'].map(tag => (
                             <span key={tag} className="px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-emerald-50 cursor-pointer transition-colors">#{tag}</span>
                         ))}
                     </div>
                     <div className="flex items-center gap-4">
                         <span className="text-gray-500 font-medium text-sm">Поделиться:</span>
                         <div className="flex gap-2">
                             <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-[#0088cc]/10 hover:text-[#0088cc] transition-colors"><FaTelegramPlane size={18}/></a>
                             <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors"><FaWhatsapp size={18}/></a>
                             <a href={`https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-[#0077FF]/10 hover:text-[#0077FF] transition-colors"><FaVk size={18}/></a>
                             <button className="p-2.5 rounded-full bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Ссылка скопирована!'); }}><Share2 size={18}/></button>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Read Next */}
             <div className="bg-gray-50 py-10 md:py-16 mt-10 md:mt-16">
                 <div className="container mx-auto px-4 max-w-6xl">
                     <h3 className="font-serif text-2xl text-emerald-900 mb-6 md:mb-8 text-center">Читайте также</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3).map(related => (
                             <Link to={`/blog/${related.id}`} key={related.id} onClick={() => window.scrollTo(0,0)} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                 <div className="h-48 overflow-hidden">
                                     <img src={related.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                                 </div>
                                 <div className="p-6">
                                     <p className="text-xs text-emerald-600 font-bold uppercase mb-2">{related.date}</p>
                                     <h4 className="font-serif text-lg text-gray-900 group-hover:text-emerald-800 transition-colors">{related.title}</h4>
                                 </div>
                             </Link>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};
