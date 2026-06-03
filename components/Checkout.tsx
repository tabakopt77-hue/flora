
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, CreditCard, ChevronLeft, ShieldCheck, Truck, Gift, Lock, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem, User, Order } from '../types';
import { Button } from './Button';
import { paymentService } from '../services/paymentService';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onPlaceOrder: (deliveryDetails: any) => void;
  total: number;
}

import { Helmet } from 'react-helmet-async';

export const Checkout: React.FC<CheckoutProps> = ({ cart, user, onPlaceOrder, total }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  
  // Delivery State
  const [deliveryType, setDeliveryType] = useState<'yandex' | 'dostavista' | 'aura'>('aura');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    contactMethod: '',
    city: 'Москва',
    street: '',
    apartment: '',
    date: '',
    time: '',
    paymentMethod: 'sberbank'
  });

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAddressSelectedFromDropdown, setIsAddressSelectedFromDropdown] = useState(false);

  // Debounced address search
  useEffect(() => {
     if (formData.street.length < 3 || isAddressSelectedFromDropdown) {
         setAddressSuggestions([]);
         setIsAddressDropdownOpen(false);
         // Reset flag after clearing to allow re-typing 
         if (formData.street.length < 3 && isAddressSelectedFromDropdown) setIsAddressSelectedFromDropdown(false);
         return;
     }
     
     const delayDebounceFn = setTimeout(async () => {
         setAddressLoading(true);
         try {
             // Constrain search to Moscow bounds
             const res = await fetch(`https://nominatim.openstreetmap.org/search?q=Москва+${encodeURIComponent(formData.street)}&format=json&limit=5&addressdetails=1&accept-language=ru`);
             const data = await res.json();
             
             // Filter out generic city suggestions, preserve street/house level
             const filtered = data.filter((item: any) => 
                 item.address && (item.address.road || item.address.pedestrian || item.address.building || item.address.house_number)
             );
             setAddressSuggestions(filtered.length > 0 ? filtered : data);
             setIsAddressDropdownOpen(true);
         } catch (e) {
             console.error("Address search error", e);
         } finally {
             setAddressLoading(false);
         }
     }, 400);

     return () => clearTimeout(delayDebounceFn);
  }, [formData.street]);

  const selectAddress = (suggestion: any) => {
      // Build clean address string
      const addr = suggestion.address;
      let cleanAddress = '';
      if (addr.road || addr.pedestrian || addr.footway) cleanAddress += (addr.road || addr.pedestrian || addr.footway) + ', ';
      if (addr.house_number) cleanAddress += 'д. ' + addr.house_number;
      else if (addr.building) cleanAddress += 'зд. ' + addr.building;
      
      if (!cleanAddress) cleanAddress = suggestion.display_name.split(',')[0];
      
      setFormData(prev => ({...prev, street: cleanAddress.replace(/,\s*$/, "")}));
      setIsAddressSelectedFromDropdown(true);
      setIsAddressDropdownOpen(false);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-serif text-emerald-900 mb-4">Ваша корзина пуста</h2>
        <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'street') {
        setIsAddressSelectedFromDropdown(false); // User typed manually
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
        // 1. Inventory Check
        setProcessingStage('Проверка наличия (Rust Core)...');
        await new Promise(r => setTimeout(r, 600));

        // 2. Prepare Payment
        if (formData.paymentMethod === 'sberbank') {
             setProcessingStage('Соединение со СберБанком...');
             // Mock Sberbank Redirect
             await new Promise(r => setTimeout(r, 1000));
             // Just proceed to success for demo
        } else {
             // 2b. Mock Card Payment (Legacy)
             setProcessingStage('Безопасная оплата (SSL)...');
             const tempOrderId = `temp_${crypto.randomUUID()}`; 
             const paymentResult = await paymentService.processPayment(tempOrderId, total, formData.paymentMethod);
             if (!paymentResult.success) {
                 alert("Оплата отклонена. Попробуйте снова.");
                 setIsProcessing(false);
                 return;
             }
        }

        // 3. Finalizing Order
        setProcessingStage('Формирование заказа...');
        await new Promise(r => setTimeout(r, 400));
        
        let deliveryServiceStr = '';
        if (deliveryType === 'yandex') deliveryServiceStr = 'Экспресс на такси по тарифу Яндекс';
        if (deliveryType === 'dostavista') deliveryServiceStr = 'Пешим курьером Достависта';
        if (deliveryType === 'aura') deliveryServiceStr = 'Доставка курьером Floramos';

        const getDeliveryCost = () => {
            if (total >= 10000) return 0;
            if (deliveryType === 'aura') return 300;
            if (deliveryType === 'dostavista') return 400;
            return 800; // yandex
        };

        const currentDeliveryCost = getDeliveryCost();

        onPlaceOrder({
            ...formData,
            deliveryDetails: { city: 'Москва', street: formData.street, apartment: formData.apartment },
            deliveryCost: currentDeliveryCost,
            deliveryService: deliveryServiceStr
        });

    } catch (error) {
        console.error(error);
        setIsProcessing(false);
        alert("Произошла ошибка при обработке заказа");
    }
  };

  const getDeliveryCost = () => {
      if (total >= 10000) return 0;
      if (deliveryType === 'aura') return 300;
      if (deliveryType === 'dostavista') return 400;
      return 800; // yandex
  };

  const deliveryCost = getDeliveryCost();
  const finalTotal = total + deliveryCost;

  const deliveryDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); 
    return d;
  });

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen bg-gray-50/50">
      <Helmet>
        <title>Оформление заказа</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Processing Overlay */}
      {isProcessing && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="relative">
                  <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                  <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-serif text-emerald-900 font-medium mb-2">{processingStage}</h3>
              <p className="text-sm text-gray-500">Пожалуйста, не закрывайте страницу</p>
          </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-emerald-900 mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Назад
      </button>

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        <div className="flex-1 space-y-8">
          <div>
             <h1 className="font-serif text-3xl text-emerald-900 mb-2">Оформление заказа</h1>
             <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                 <ShieldCheck size={14} />
                 <span>Защищенное соединение 256-bit SSL</span>
             </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">1</div>
                Контактные данные
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя получателя</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Иван Иванов" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+7 (999) 000-00-00" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Желаемый вид связи (опционально)</label>
                  <input name="contactMethod" value={formData.contactMethod || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Например: WhatsApp, Telegram, звонок" />
                </div>
              </div>
            </section>

            {/* Delivery Address & Method */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">2</div>
                Адрес и Доставка
              </h3>

              <div className="grid grid-cols-1 gap-4 mb-6">
                 <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${deliveryType === 'aura' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="deliveryType" value="aura" checked={deliveryType === 'aura'} onChange={() => setDeliveryType('aura')} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                        <div className="font-bold text-gray-900">Доставка курьером Floramos</div>
                        <div className="text-xs text-gray-500">Бережная доставка нашими сотрудниками (300 ₽)</div>
                    </div>
                 </label>

                 <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${deliveryType === 'dostavista' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="deliveryType" value="dostavista" checked={deliveryType === 'dostavista'} onChange={() => setDeliveryType('dostavista')} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                        <div className="font-bold text-gray-900">Пешим курьером Достависта</div>
                        <div className="text-xs text-gray-500">Быстрая доставка по Москве (400 ₽)</div>
                    </div>
                 </label>

                 <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${deliveryType === 'yandex' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="deliveryType" value="yandex" checked={deliveryType === 'yandex'} onChange={() => setDeliveryType('yandex')} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                        <div className="font-bold text-gray-900">Экспресс на такси по тарифу Яндекс</div>
                        <div className="text-xs text-gray-500">Срочная доставка на авто (800 ₽)</div>
                    </div>
                 </label>
              </div>
              
              <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Улица, дом</label>
                      <input required name="street" value={formData.street} onChange={handleInputChange} onFocus={() => formData.street.length >= 3 && setAddressSuggestions([...addressSuggestions])} onBlur={() => setTimeout(() => setIsAddressDropdownOpen(false), 200)} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ул. Тверская, д. 1" autoComplete="off" />
                      
                      {addressLoading && (
                          <div className="absolute right-3 top-10 pointer-events-none">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                      )}

                      {/* Autocomplete Dropdown */}
                      {isAddressDropdownOpen && addressSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                              {addressSuggestions.map((suggestion, idx) => {
                                 // Format display string
                                 const addr = suggestion.address || {};
                                 const mainText = (addr.road || addr.pedestrian || addr.footway || suggestion.name || '').replace('улица', 'ул.');
                                 const houseText = addr.house_number ? `д. ${addr.house_number}` : (addr.building ? `зд. ${addr.building}` : '');
                                 const districtMatch = suggestion.display_name.split(',').find((part: string) => part.includes('район'));
                                 const subText = districtMatch ? districtMatch.trim() : (addr.suburb || addr.city_district || 'Москва');
                                 
                                 return (
                                     <div 
                                         key={suggestion.place_id || idx} 
                                         className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                         onMouseDown={(e) => {
                                             e.preventDefault(); // Prevent input blur
                                             selectAddress(suggestion);
                                         }}
                                     >
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400 shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {mainText} {houseText}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {subText}
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                 );
                              })}
                          </div>
                      )}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Квартира / Офис</label>
                      <input name="apartment" value={formData.apartment} onChange={handleInputChange} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="кв. 12" />
                  </div>
              </div>
            </section>

            {/* Time & Date */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">3</div>
                Время доставки
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Calendar size={16} /> Дата</label>
                   <select required name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                     <option value="">Выберите дату</option>
                     {deliveryDates.map(date => (
                       <option key={date.toISOString()} value={date.toLocaleDateString('ru-RU')}>
                         {date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                       </option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Clock size={16} /> Интервал</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['10:00 - 14:00', '14:00 - 18:00', '18:00 - 22:00'].map(slot => (
                        <button type="button" key={slot} onClick={() => setFormData(prev => ({...prev, time: slot}))} className={`p-2 text-sm rounded-lg border transition-all ${formData.time === slot ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
                          {slot}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">4</div>
                Оплата
              </h3>
              <div className="space-y-4">
                 <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${formData.paymentMethod === 'sberbank' ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="sberbank" checked={formData.paymentMethod === 'sberbank'} onChange={handleInputChange} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 p-1">
                        {/* Sberbank Logo Placeholder */}
                        <div className="w-8 h-8 rounded-full border-2 border-green-600 border-r-transparent rotate-45"></div>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">SberPay / Банковская карта</div>
                        <div className="text-xs text-gray-500">Быстрая оплата через СберБанк</div>
                    </div>
                 </label>

                 <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${formData.paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                        <span className="font-bold text-emerald-800">₽</span>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">Наличными курьеру</div>
                        <div className="text-xs text-gray-500">При получении</div>
                    </div>
                 </label>
              </div>
            </section>
          </form>
        </div>

        {/* Right Column - Summary */}
        <div className="w-full lg:w-96">
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:sticky lg:top-24">
              <h3 className="font-serif text-xl mb-6">Ваш заказ</h3>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{item.quantity} шт x {item.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Товары</span>
                   <span>{total.toLocaleString('ru-RU')} ₽</span>
                 </div>
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Доставка</span>
                   {deliveryCost === 0 ? <span className="text-emerald-600 font-medium">Бесплатно</span> : <span>{deliveryCost} ₽</span>}
                 </div>
                 <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100 mt-2">
                   <span>Итого</span>
                   <span>{finalTotal.toLocaleString('ru-RU')} ₽</span>
                 </div>
              </div>

              <Button className={`w-full py-4 text-lg shadow-xl ${formData.paymentMethod === 'sberbank' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-emerald-900 shadow-emerald-200'}`} type="submit" form="checkout-form" disabled={isProcessing}>
                 {isProcessing ? 'Обработка...' : formData.paymentMethod === 'sberbank' ? 'Оплатить через SberPay' : 'Подтвердить заказ'}
              </Button>
              <p className="text-[11px] text-gray-500 mt-4 text-center leading-relaxed">
                Нажимая кнопку, вы даете согласие на обработку персональных данных в соответствии с <a href="#" className="underline hover:text-emerald-700 transition-colors">Политикой конфиденциальности</a> (ФЗ от 27.07.2006 г. № 152-ФЗ) и принимаете <a href="#" className="underline hover:text-emerald-700 transition-colors">Пользовательское соглашение</a>.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
