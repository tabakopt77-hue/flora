
import React from 'react';
import { Product, Category, BlogPost, SellerStat } from './types';
import yandexProducts from './yandexProducts.json';

// Mock Store ID for main seller
const MAIN_STORE_ID = 's1';

const yandexMappedProducts: Product[] = yandexProducts.map((p: any) => ({
  ...p,
  category: Category.BOUQUETS
}));

export const PRODUCTS: Product[] = [
  ...yandexMappedProducts
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'march-8-history',
    title: '8 Марта: История борьбы и праздника весны',
    excerpt: 'От забастовок текстильщиц до главного праздника весны. Узнайте настоящую историю Международного женского дня.',
    content: (
      <>
        <p className="lead text-xl text-gray-600 font-serif italic mb-8 border-l-4 border-emerald-200 pl-4">
          Сегодня 8 Марта ассоциируется у нас с тюльпанами, мимозой и нежными словами. Но за этим праздником стоит мощная история борьбы женщин за свои права, равенство и уважение. Давайте заглянем в прошлое, чтобы понять, как день солидарности превратился в день весны и красоты.
        </p>

        <h3>Истоки: Нью-Йорк, 1857 и 1908</h3>
        <p>
          Все началось не с цветов, а с требований. 8 марта 1857 года работницы текстильных фабрик Нью-Йорка вышли на улицы, требуя сокращения рабочего дня (который длился 16 часов!) и равной оплаты труда с мужчинами. Эта акция вошла в историю как "Марш пустых кастрюль".
        </p>
        <p>
          Спустя полвека, в 1908 году, история повторилась: 15 000 женщин снова прошли маршем через Нью-Йорк, требуя избирательного права и лучших условий труда.
        </p>

        <figure className="my-8">
            <img 
               src="https://images.unsplash.com/photo-1596723363353-289a40719cf2?q=80&w=1200&auto=format&fit=crop" 
               alt="Vintage Suffragettes" 
               className="rounded-xl shadow-lg w-full object-cover h-[400px]"
            />
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">Женщины начала XX века, борющиеся за свои права</figcaption>
        </figure>

        <h3>Клара Цеткин и Копенгаген</h3>
        <p>
          В 1910 году в Копенгагене состоялась Вторая Международная конференция работающих женщин. Именно там немецкая активистка <strong>Клара Цеткин</strong> предложила учредить Международный женский день. Идея заключалась в том, чтобы в этот день женщины по всему миру устраивали митинги и шествия, привлекая внимание к своим проблемам.
        </p>

        <h3>Хронология событий</h3>
        <div className="overflow-x-auto my-8">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b-2 border-emerald-100 bg-emerald-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-serif text-emerald-900">Год</th>
                  <th scope="col" className="px-6 py-4 font-serif text-emerald-900">Событие</th>
                  <th scope="col" className="px-6 py-4 font-serif text-emerald-900">Значение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                <tr className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-800">1910</td>
                  <td className="px-6 py-4">Конференция в Копенгагене</td>
                  <td className="px-6 py-4">Предложение Клары Цеткин учредить праздник</td>
                </tr>
                <tr className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-800">1911</td>
                  <td className="px-6 py-4">Первые празднования</td>
                  <td className="px-6 py-4">Отмечен в Германии, Австрии, Дании и Швейцарии</td>
                </tr>
                <tr className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-800">1917</td>
                  <td className="px-6 py-4">Забастовка в Петрограде</td>
                  <td className="px-6 py-4">Начало Февральской революции, женщины получили право голоса</td>
                </tr>
                <tr className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-800">1975</td>
                  <td className="px-6 py-4">Признание ООН</td>
                  <td className="px-6 py-4">ООН официально провозгласила 8 марта Международным женским днем</td>
                </tr>
              </tbody>
            </table>
        </div>

        <h3>Почему именно 8 марта?</h3>
        <p>
          Дата закрепилась благодаря событиям в России. 23 февраля 1917 года по юлианскому календарю (что соответствует 8 марта по григорианскому) работницы Петрограда вышли на демонстрацию с лозунгами "Хлеба и мира!". Это выступление стало искрой, которая привела к Февральской революции и, в конечном итоге, к предоставлению женщинам избирательного права.
        </p>

        <h3>Современный праздник</h3>
        <p>
          Сегодня политическая окраска праздника во многих странах смягчилась. 8 Марта стало днем, когда мы выражаем любовь, восхищение и благодарность женщинам — мамам, бабушкам, женам, дочерям и коллегам. Это праздник весны, красоты и женственности.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <img 
               src="https://images.unsplash.com/photo-1490750967868-58cb75062ed0?q=80&w=800&auto=format&fit=crop" 
               alt="Spring Flowers" 
               className="rounded-xl shadow-md object-cover h-64 w-full hover:scale-105 transition-transform duration-500"
            />
            <img 
               src="https://images.unsplash.com/photo-1563241527-3004b7be0fee?q=80&w=800&auto=format&fit=crop" 
               alt="Florist Work" 
               className="rounded-xl shadow-md object-cover h-64 w-full hover:scale-105 transition-transform duration-500"
            />
        </div>

        <blockquote>
          "История борьбы женщин за равенство не принадлежит ни одной феминистке и ни одной организации, но коллективным усилиям всех, кто заботится о правах человека." — Глория Стайнем
        </blockquote>

        <p>
          В Floramos мы чтим традиции и верим, что каждый букет, подаренный в этот день, — это не просто цветы, а символ уважения, признания и любви.
        </p>
      </>
    ),
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=1200&auto=format&fit=crop',
    date: '8 марта 2024',
    author: 'Анна Воронцова',
    readTime: '7 мин',
    category: 'События'
  },
  {
    id: '1',
    title: 'Язык цветов: Новый взгляд',
    excerpt: 'Как старинные традиции викторианской эпохи обретают новый смысл в современном мире.',
    content: (
        <>
            <p className="lead text-xl text-gray-600 font-serif italic mb-8 border-l-4 border-emerald-200 pl-4">
                Цветы всегда были чем-то большим, чем просто украшение. В викторианскую эпоху каждый бутон нес в себе тайное послание. 
                Сегодня мы возвращаем эту магию, используя язык цветов для выражения самых глубоких чувств.
            </p>
            <h3>Символизм в деталях</h3>
            <p>
                Выбирая розы, вы говорите о страсти. Пионы шепчут о нежности и счастливом браке. 
                А скромные полевые цветы могут рассказать о искренности намерений лучше тысячи слов.
                В Floramos мы создаем композиции, которые можно "читать" как открытую книгу.
            </p>
            <figure>
                <img 
                    src="https://images.unsplash.com/photo-1563241527-3004b7be0fee?q=80&w=1200&auto=format&fit=crop" 
                    alt="Flower Arrangement" 
                    className="rounded-xl shadow-lg my-8 w-full"
                />
                <figcaption className="text-center text-sm text-gray-500 mt-2">Процесс создания авторской композиции</figcaption>
            </figure>
            <h3>Современный взгляд</h3>
            <p>
                Мы не ограничиваемся классикой. Наши флористы экспериментируют с формой, текстурой и даже ароматом.
                Использование сухоцветов добавляет нотку богемного шика, а экзотические растения превращают букет в арт-объект.
            </p>
            <blockquote>
                "Цветы — это остатки рая на земле." — Иоанн Кронштадтский
            </blockquote>
            <p>
                Давайте вместе наполнять жизнь красотой и смыслом. Следите за нашими обновлениями, чтобы узнавать больше о мире флористики.
            </p>
        </>
    ),
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    date: '15 марта 2024',
    author: 'Максим Иванов',
    readTime: '5 мин',
    category: 'Флористика'
  },
  {
    id: '2',
    title: 'Осознанная флористика',
    excerpt: 'Почему мы выбираем местных фермеров и отказываемся от пластиковой упаковки.',
    content: 'Полный текст статьи...',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop',
    date: '10 марта 2024',
    author: 'Елена Лебедева',
    readTime: '3 мин',
    category: 'Флористика'
  },
  {
    id: '3',
    title: 'Минимализм в деталях',
    excerpt: 'Искусство создания пространства с помощью всего одного цветка.',
    content: 'Полный текст статьи...',
    image: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?q=80&w=800&auto=format&fit=crop',
    date: '05 марта 2024',
    author: 'Анна Смирнова',
    readTime: '4 мин',
    category: 'Уход за растениями'
  }
];

export const SELLER_STATS: SellerStat[] = [
  { label: 'Выручка', value: '1 245 000 ₽', change: 12.5, trend: 'up' },
  { label: 'Заказы', value: '156', change: 8.2, trend: 'up' },
  { label: 'Ср. чек', value: '7 980 ₽', change: 2.1, trend: 'down' },
  { label: 'Конверсия', value: '3.2%', change: 0.4, trend: 'up' }
];

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=1920&auto=format&fit=crop';

export const HERO_FLOWERS = [
  {
    image: 'https://images.unsplash.com/photo-1596073419667-9d77d59f033f?q=80&w=1000&auto=format&fit=crop',
    name: 'Розовая Нежность',
    occasion: 'Идеально для первого свидания'
  },
  {
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=1000&auto=format&fit=crop',
    name: 'Алая Страсть',
    occasion: 'Для признания в любви'
  },
  {
    image: 'https://images.unsplash.com/photo-1620121474661-0094943513b2?q=80&w=1000&auto=format&fit=crop',
    name: 'Королевская Лилия',
    occasion: 'Знак уважения и восхищения'
  },
  {
    image: 'https://images.unsplash.com/photo-1588613460322-86470085203e?q=80&w=1000&auto=format&fit=crop',
    name: 'Дикая Орхидея',
    occasion: 'Для утонченных натур'
  },
  {
    image: 'https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?q=80&w=1000&auto=format&fit=crop',
    name: 'Пион "Сара Бернар"',
    occasion: 'На день рождения или юбилей'
  },
  {
    image: 'https://images.unsplash.com/photo-1591206369811-4eeb2f03bc95?q=80&w=1000&auto=format&fit=crop',
    name: 'Красный Бархат',
    occasion: 'Символ глубокой привязанности'
  },
  {
    image: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=1000&auto=format&fit=crop',
    name: 'Тропический Гибискус',
    occasion: 'Для ярких и энергичных'
  },
  {
    image: 'https://images.unsplash.com/photo-1566927467984-6332be7377d0?q=80&w=1000&auto=format&fit=crop',
    name: 'Белая Магнолия',
    occasion: 'Символ чистоты и благородства'
  },
  {
    image: 'https://images.unsplash.com/photo-1531875456613-9f3e525b6c8d?q=80&w=1000&auto=format&fit=crop',
    name: 'Ночная Фиалка',
    occasion: 'Для загадочной незнакомки'
  },
  {
    image: 'https://images.unsplash.com/photo-1606041011872-596597976b25?q=80&w=1000&auto=format&fit=crop',
    name: 'Белоснежный Лотос',
    occasion: 'Для духовного единения'
  },
  {
    image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?q=80&w=1000&auto=format&fit=crop',
    name: 'Синяя Гортензия',
    occasion: 'В знак благодарности'
  },
  {
    image: 'https://images.unsplash.com/photo-1550948537-130a1ce83314?q=80&w=1000&auto=format&fit=crop',
    name: 'Фиолетовый Ирис',
    occasion: 'Символ мудрости и доверия'
  },
  {
    image: 'https://images.unsplash.com/photo-1572454591674-2739f30d8c40?q=80&w=1000&auto=format&fit=crop',
    name: 'Солнечный Нарцисс',
    occasion: 'Для весеннего настроения'
  },
  {
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0fee?q=80&w=1000&auto=format&fit=crop',
    name: 'Полевой Микс',
    occasion: 'Просто так, без повода'
  },
  {
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
    name: 'Темная Роза',
    occasion: 'Для роковой женщины'
  },
  {
    image: 'https://images.unsplash.com/photo-1555050556-2e0618713313?q=80&w=1000&auto=format&fit=crop',
    name: 'Оранжевый Ранункулюс',
    occasion: 'Пожелание успеха и богатства'
  },
  {
    image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?q=80&w=1000&auto=format&fit=crop',
    name: 'Тюльпан "Триумф"',
    occasion: 'На 8 Марта'
  },
  {
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=1000&auto=format&fit=crop',
    name: 'Классическая Роза',
    occasion: 'Вечная классика любви'
  },
  {
    image: 'https://images.unsplash.com/photo-1530281063623-66881768656f?q=80&w=1000&auto=format&fit=crop',
    name: 'Розовый Бутон',
    occasion: 'Для юной леди'
  },
  {
    image: 'https://images.unsplash.com/photo-1561542320-9a18cd340469?q=80&w=1000&auto=format&fit=crop',
    name: 'Лилия "Касабланка"',
    occasion: 'На свадьбу'
  },
  {
    image: 'https://images.unsplash.com/photo-1597826368522-9f4588b6aa7d?q=80&w=1000&auto=format&fit=crop',
    name: 'Орхидея Фаленопсис',
    occasion: 'Для украшения дома'
  },
  {
    image: 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?q=80&w=1000&auto=format&fit=crop',
    name: 'Красный Тюльпан',
    occasion: 'Признание в чувствах'
  },
  {
    image: 'https://images.unsplash.com/photo-1582794543139-8ac92a9abf30?q=80&w=1000&auto=format&fit=crop',
    name: 'Пион "Корал"',
    occasion: 'На годовщину'
  },
  {
    image: 'https://images.unsplash.com/photo-1551893665-2843f5481d3f?q=80&w=1000&auto=format&fit=crop',
    name: 'Желтая Роза',
    occasion: 'Знак дружбы и примирения'
  },
  {
    image: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?q=80&w=1000&auto=format&fit=crop',
    name: 'Белая Роза',
    occasion: 'Символ невинности'
  },
  {
    image: 'https://images.unsplash.com/photo-1587575494201-11fe74d90d38?q=80&w=1000&auto=format&fit=crop',
    name: 'Гвоздика Шабо',
    occasion: 'Знак верности'
  },
  {
    image: 'https://images.unsplash.com/photo-1613539246066-78db6ec4ff0f?q=80&w=1000&auto=format&fit=crop',
    name: 'Голубая Гортензия',
    occasion: 'Для спокойствия и гармонии'
  },
  {
    image: 'https://images.unsplash.com/photo-1590050847257-259545873753?q=80&w=1000&auto=format&fit=crop',
    name: 'Ирис "Сибирика"',
    occasion: 'Хорошие новости'
  },
  {
    image: 'https://images.unsplash.com/photo-1608658828751-c0316749e227?q=80&w=1000&auto=format&fit=crop',
    name: 'Тигровая Лилия',
    occasion: 'Символ процветания'
  },
  {
    image: 'https://images.unsplash.com/photo-1579969568953-f7979344756f?q=80&w=1000&auto=format&fit=crop',
    name: 'Гербера Джемсона',
    occasion: 'Для отличного настроения'
  }
];
