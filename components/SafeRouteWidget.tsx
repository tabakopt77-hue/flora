import React, { useEffect, useRef } from 'react';
import { CartItem } from '../types';

interface SafeRouteWidgetProps {
  userFullName?: string;
  userPhone?: string;
  cart: CartItem[];
  onDeliveryChange?: (data: any) => void;
}

declare global {
  interface Window {
    SafeRouteCartWidget: any;
  }
}

export const SafeRouteWidget: React.FC<SafeRouteWidgetProps> = ({ userFullName, userPhone, cart, onDeliveryChange }) => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const initWidget = () => {
      if (window.SafeRouteCartWidget && !widgetRef.current) {
        try {
          widgetRef.current = new window.SafeRouteCartWidget('saferoute-cart-widget', {
            api_token: '0sfs2_7c9w1brO6PIjM_zpYC5Q22pxDy', // Token provided by user
            userFullName: userFullName,
            userPhone: userPhone,
            products: cart.map(item => ({
              name: item.name,
              price: item.price,
              count: item.quantity
            }))
          });

          widgetRef.current.on('change', (delivery: any) => {
            console.log('SafeRoute delivery changed:', delivery);
            if (onDeliveryChange) {
              onDeliveryChange(delivery);
            }
          });

          widgetRef.current.on('done', (delivery: any) => {
            console.log('SafeRoute delivery done:', delivery);
            if (onDeliveryChange) {
              onDeliveryChange(delivery);
            }
          });
          
          widgetRef.current.on('error', (error: any) => {
            console.error('SafeRoute widget error:', error);
          });
        } catch (e) {
          console.error('Failed to initialize SafeRoute widget:', e);
        }
      }
    };

    // Load the script
    const scriptId = 'saferoute-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://widgets.saferoute.ru/cart/api.js?new_widget=1';
      script.async = true;
      script.charset = 'UTF-8';
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (widgetRef.current && typeof widgetRef.current.destruct === 'function') {
        widgetRef.current.destruct();
        widgetRef.current = null;
      }
    };
  }, [userFullName, userPhone, cart]);

  return (
    <div id="saferoute-cart-widget" className="w-full min-h-[400px] border border-gray-200 rounded-xl overflow-hidden"></div>
  );
};
