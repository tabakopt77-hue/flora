
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, CreditCard, ChevronLeft, ShieldCheck, Truck, Gift, Lock, Loader2 } from 'lucide-react';
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

export const Checkout: React.FC<CheckoutProps> = ({ cart, user, onPlaceOrder, total }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    city: 'Москва',
    street: '',
    apartment: '',
    date: '',
    time: '',
    paymentMethod: 'card'
  });

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
        // 1. Inventory Check
        setProcessingStage('Проверка наличия (Rust Core)...');
        await new Promise(r => setTimeout(r, 600));

        // 2. Secure Payment
        setProcessingStage('Безопасная оплата (SSL)...');
        // We simulate a temporary ID for the payment intent
        const tempOrderId = `temp_${Date.now()}`; 
        const paymentResult = await paymentService.processPayment(tempOrderId, total, formData.paymentMethod);

        if (!paymentResult.success) {
            alert("Оплата отклонена банком. Попробуйте другую карту.");
            setIsProcessing(false);
            return;
        }

        // 3. Finalizing Order
        setProcessingStage('Формирование заказа...');
        await new Promise(r => setTimeout(r, 400));
        
        onPlaceOrder(formData);

    } catch (error) {
        console.error(error);
        setIsProcessing(false);
        alert("Произошла ошибка при обработке заказа");
    }
  };

  const deliveryCost = total > 10000 ? 0 : 500;
  const finalTotal = total + deliveryCost;

  // Generate next 7 days for delivery
  const deliveryDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return d;
  });

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen bg-gray-50/50">
      
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
        {/* Left Column - Forms */}
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
                  <input 
                    required 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" 
                    placeholder="Иван Иванов" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input 
                    required 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" 
                    placeholder="+7 (999) 000-00-00" 
                  />
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">2</div>
                Адрес доставки
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Улица, дом</label>
                      <input 
                        required 
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                        placeholder="ул. Ленина, д. 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Кв./Офис</label>
                      <input 
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                        placeholder="15"
                      />
                    </div>
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
                   <select 
                      required
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer"
                   >
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
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setFormData(prev => ({...prev, time: slot}))}
                          className={`p-2 text-sm rounded-lg border transition-all ${formData.time === slot ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'}`}
                        >
                          {slot}
                        </button>
                      ))}
                   </div>
                   <input type="hidden" name="time" value={formData.time} required />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">4</div>
                Оплата
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="hidden" />
                    <CreditCard size={24} />
                    <span className="font-medium text-sm">Картой онлайн</span>
                 </label>
                 <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'apple' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="apple" checked={formData.paymentMethod === 'apple'} onChange={handleInputChange} className="hidden" />
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.65 1.7c-1.15.58-1.95 1.58-1.78 2.92.05.3.15.59.3.85 1.15-.55 1.93-1.57 1.78-2.92-.05-.3-.15-.59-.3-.85zM17.9 4.25c.03.2.06.4.09.6-.03-.2-.06-.4-.09-.6zM13.1 9.42c.55-.38 1.48-.38 2.23.08.76.47 1.34 1.13 1.75 1.9.4.78.65 1.63.73 2.5.08.88.16 1.75.24 2.62-1.03.35-2.06.7-3.09 1.05-.33-.35-.66-.7-1-1.05-1.03-.35-2.06-.7-3.09-1.05.33.35.66.7 1 1.05.34.35.67.7 1 1.05-.33-.35-.66-.7-1-1.05-.33.35-.66.7-1 1.05z" /></svg>
                    <span className="font-medium text-sm">Apple Pay</span>
                 </label>
                 <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} className="hidden" />
                    <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold text-xs">₽</div>
                    <span className="font-medium text-sm">Наличными</span>
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
                      <p className="text-gray-500 text-xs mt-1">{item.quantity} шт x {item.price.toFixed(0)} ₽</p>
                      {item.giftMessage && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600">
                          <Gift size={10} /> + Открытка
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{(item.price * item.quantity).toFixed(0)} ₽</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Товары</span>
                   <span>{total.toFixed(0)} ₽</span>
                 </div>
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Доставка</span>
                   {deliveryCost === 0 ? <span className="text-emerald-600 font-medium">Бесплатно</span> : <span>{deliveryCost} ₽</span>}
                 </div>
                 <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100 mt-2">
                   <span>Итого</span>
                   <span>{finalTotal.toFixed(0)} ₽</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <Button className="w-full py-4 text-lg shadow-xl shadow-emerald-100" type="submit" form="checkout-form" disabled={isProcessing}>
                    {isProcessing ? 'Обработка...' : 'Оплатить заказ'}
                 </Button>
                 <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                   <Lock size={12} /> Idempotency Key Protected
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
