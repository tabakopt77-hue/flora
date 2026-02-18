
import { Product, Category, BlogPost, SellerStat } from './types';

// Mock Store ID for main seller
const MAIN_STORE_ID = 's1';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    storeId: MAIN_STORE_ID,
    name: 'Дыхание Весны',
    price: 45.00,
    stock: 15,
    isActive: true,
    category: Category.BOUQUETS,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop',
    description: 'Сочный микс тюльпанов и нарциссов — воплощение пробуждения природы.',
    longDescription: 'Наш фирменный весенний букет собран из отборных голландских тюльпанов и солнечных нарциссов. Дополненный свежей сезонной зеленью, этот букет наполнит ваш дом ароматом цветущего луга и подарит ощущение легкости.',
    tags: ['весна', 'свежесть', 'яркие краски'],
    careInstructions: 'Подрежьте стебли на 2 см под углом 45 градусов. Меняйте воду ежедневно — тюльпаны любят "пить". Держите вдали от батарей и прямых солнечных лучей.',
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    storeId: MAIN_STORE_ID,
    name: 'Бархатный Шик',
    price: 89.99,
    stock: 8,
    isActive: true,
    category: Category.BOUQUETS,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    description: 'Безупречные красные розы в премиальной шляпной коробке.',
    longDescription: 'Двадцать четыре эквадорские розы с крупным бутоном, бережно очищенные от шипов и уложенные в нашу фирменную бархатную коробку. Это не просто цветы, это высшее проявление чувств и элегантности.',
    tags: ['романтика', 'премиум', 'классика'],
    careInstructions: 'Аккуратно подливайте немного прохладной воды в центр губки (оазиса) каждые 2 дня. Не вынимайте цветы из композиции, чтобы сохранить форму.',
    rating: 4.9,
    reviews: 89
  },
  {
    id: '3',
    storeId: MAIN_STORE_ID,
    name: 'Монстера Делициоза',
    price: 35.00,
    stock: 20,
    isActive: true,
    category: Category.POTTED,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop',
    description: 'Легендарное растение с резными листьями. Стильное и неприхотливое.',
    tags: ['интерьер', 'тренды', 'легкий уход'],
    careInstructions: 'Полив умеренный: дождитесь, пока верхний слой грунта просохнет. Любит опрыскивание — это помогает листьям оставаться упругими и красивыми.',
    rating: 4.7,
    reviews: 210
  },
  {
    id: '4',
    storeId: MAIN_STORE_ID,
    name: 'Богемная Рапсодия',
    price: 55.00,
    stock: 12,
    isActive: true,
    category: Category.DRIED,
    image: 'https://images.unsplash.com/photo-1662369628045-3df53eb24d86?q=80&w=800&auto=format&fit=crop',
    description: 'Долговечная интерьерная композиция из пампасной травы и лагуруса.',
    tags: ['бохо', 'эко-стиль', 'вечность'],
    careInstructions: 'Не требуют воды. Держите в сухом месте. Чтобы очистить от пыли, можно аккуратно обдуть феном на холодном режиме с расстояния 30 см.',
    rating: 4.6,
    reviews: 56
  },
  {
    id: '5',
    storeId: MAIN_STORE_ID,
    name: 'Нежность Невесты',
    price: 120.00,
    stock: 5,
    isActive: true,
    category: Category.WEDDING,
    image: 'https://images.unsplash.com/photo-1523693916904-896866160167?q=80&w=800&auto=format&fit=crop',
    description: 'Воздушные пионы и эвкалипт — квинтэссенция свадебной элегантности.',
    tags: ['свадьба', 'любовь', 'пионы'],
    rating: 5.0,
    reviews: 32
  },
  {
    id: '6',
    storeId: MAIN_STORE_ID,
    name: 'Ваза Artisan "Крафт"',
    price: 28.00,
    stock: 50,
    isActive: true,
    category: Category.GIFTS,
    image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?q=80&w=800&auto=format&fit=crop',
    description: 'Керамическая ваза ручной работы с уникальной текстурой глазури.',
    tags: ['декор', 'ручная работа', 'уют'],
    rating: 4.5,
    reviews: 45
  },
  {
    id: '7',
    storeId: MAIN_STORE_ID,
    name: 'Огненный Закат',
    price: 42.50,
    stock: 18,
    isActive: true,
    category: Category.BOUQUETS,
    image: 'https://images.unsplash.com/photo-1599733589046-10c005739ef9?q=80&w=800&auto=format&fit=crop',
    description: 'Пышные георгины теплых оттенков, напоминающие о летних вечерах.',
    tags: ['тепло', 'настроение', 'осень'],
    rating: 4.8,
    reviews: 78
  },
  {
    id: '8',
    storeId: MAIN_STORE_ID,
    name: 'Фикус Лирата',
    price: 65.00,
    stock: 7,
    isActive: true,
    category: Category.POTTED,
    image: 'https://images.unsplash.com/photo-1616690248297-236b231eb93a?q=80&w=800&auto=format&fit=crop',
    description: 'Деревце с крупными скульптурными листьями — главный акцент вашего интерьера.',
    tags: ['крупномер', 'стиль', 'офис'],
    careInstructions: 'Любит яркий, но рассеянный свет. Протирайте листья влажной губкой от пыли, чтобы они блестели.',
    rating: 4.4,
    reviews: 112
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Язык цветов: Новый взгляд',
    excerpt: 'Как старинные традиции викторианской эпохи обретают новый смысл в современном мире.',
    content: 'Полный текст статьи...',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    date: '15 марта 2024',
    author: 'Flora AI',
    readTime: '5 мин'
  },
  {
    id: '2',
    title: 'Осознанная флористика',
    excerpt: 'Почему мы выбираем местных фермеров и отказываемся от пластиковой упаковки.',
    content: 'Полный текст статьи...',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop',
    date: '10 марта 2024',
    author: 'Елена Вудс',
    readTime: '3 мин'
  },
  {
    id: '3',
    title: 'Минимализм в деталях',
    excerpt: 'Искусство создания пространства с помощью всего одного цветка.',
    content: 'Полный текст статьи...',
    image: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?q=80&w=800&auto=format&fit=crop',
    date: '05 марта 2024',
    author: 'Flora AI',
    readTime: '4 мин'
  }
];

export const SELLER_STATS: SellerStat[] = [
  { label: 'Выручка', value: '1 245 000 ₽', change: 12.5, trend: 'up' },
  { label: 'Заказы', value: '156', change: 8.2, trend: 'up' },
  { label: 'Ср. чек', value: '7 980 ₽', change: 2.1, trend: 'down' },
  { label: 'Конверсия', value: '3.2%', change: 0.4, trend: 'up' }
];

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=1920&auto=format&fit=crop';
