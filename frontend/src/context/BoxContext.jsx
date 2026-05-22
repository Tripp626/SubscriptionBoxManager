import { createContext, useContext, useState } from 'react';

const BoxContext = createContext(null);

export function BoxProvider({ children }) {
  const [currentBox, setCurrentBox] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const setBox = (data) => {
    if (data) {
      setCurrentBox(data.box);
      setSubscription(data.subscription);
    } else {
      setCurrentBox(null);
      setSubscription(null);
    }
  };

  const swapProduct = (oldProductId, newProductId) => {
    if (!currentBox) return;
    setCurrentBox(prev => ({
      ...prev,
      products: prev.products.map(p =>
        (p._id === oldProductId) ? { _id: newProductId } : p
      ),
      status: 'customized',
      isPersonalized: true,
    }));
  };

  const isShipped = currentBox?.status === 'shipped' || currentBox?.status === 'delivered';
  const canCustomize = currentBox && (currentBox.status === 'auto_generated' || currentBox.status === 'customized');

  return (
    <BoxContext.Provider value={{ currentBox, subscription, setBox, swapProduct, canCustomize, isShipped }}>
      {children}
    </BoxContext.Provider>
  );
}

export const useBox = () => useContext(BoxContext);
