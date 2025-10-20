// 공용(메모리) 카트 저장소: 개발용 데모
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
};

const g = globalThis as any;
if (!g.__CART__) g.__CART__ = { items: [] as CartItem[] } as CartState;

export const cartStore: CartState = g.__CART__;

