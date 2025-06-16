export type TConstructorItems = {
  bun: Partial<TIngredient>;
  ingredients: TIngredientUnique[];
};

export type TIngredient = {
  _id: string;
  type: string;
  image_mobile: string;
  price: number;
};

export type TIngredientUnique = TIngredient & { uniqueId: string };

export type TConstructorIngredient = TIngredient & {
  uniqueId: string;
};

export type TOrder = {
  _id: string;
  status: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  number: number;
  ingredients: string[];
};

export type TOrdersData = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

export type TUser = {
  email: string;
  name: string;
};

export type TTabMode = 'bun' | 'sauce' | 'main';
