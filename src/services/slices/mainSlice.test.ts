import mainSlice, {
    initialState,
    addIngredient,
    closeOrderRequest,
    deleteIngredient,
    moveIngredientUp,
    moveIngredientDown,
    fetchIngredients,
    fetchNewOrder,
    fetchLoginUser,
    fetchRegisterUser,
    getUserThunk,
    fetchFeed,
    fetchUserOrders,
    fetchLogout,
    fetchUpdateUser
  } from './mainSlice';
  import { TIngredient, TOrder, TUser } from '@utils-types';
  import { getIngredientsApi, orderBurgerApi, loginUserApi, registerUserApi, getUserApi, getFeedsApi, getOrdersApi, logoutApi, updateUserApi } from '@api';
  import { setCookie, deleteCookie } from '../../utils/cookie';
  
  // Мокируем API вызовы
  jest.mock('@api', () => ({
    getIngredientsApi: jest.fn(),
    orderBurgerApi: jest.fn(),
    loginUserApi: jest.fn(),
    registerUserApi: jest.fn(),
    getUserApi: jest.fn(),
    getFeedsApi: jest.fn(),
    getOrdersApi: jest.fn(),
    logoutApi: jest.fn(),
    updateUserApi: jest.fn()
  }));
  
  jest.mock('../../utils/cookie', () => ({
    setCookie: jest.fn(),
    deleteCookie: jest.fn()
  }));
  
  describe('mainSlice reducers', () => {
    it('should return the initial state', () => {
      expect(mainSlice(undefined, { type: '' })).toEqual(initialState);
    });
  
    it('should handle addIngredient for bun', () => {
      const bun: TIngredient = {
        _id: '1',
        name: 'Bun',
        type: 'bun',
        price: 100
      };
      const action = addIngredient(bun);
      const state = mainSlice(initialState, action);
      expect(state.constructorItems.bun).toEqual(bun);
    });
  
    it('should handle addIngredient for non-bun', () => {
      const ingredient: TIngredient = {
        _id: '2',
        name: 'Cheese',
        type: 'main',
        price: 50
      };
      const action = addIngredient(ingredient);
      const state = mainSlice(initialState, action);
      expect(state.constructorItems.ingredients).toHaveLength(1);
      expect(state.constructorItems.ingredients[0]).toMatchObject({
        ...ingredient,
        uniqueId: expect.any(String)
      });
    });
  
    it('should handle deleteIngredient', () => {
      const initialStateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { _id: '1', name: 'Cheese', type: 'main', price: 50, uniqueId: '123' }
          ]
        }
      };
      const action = deleteIngredient({ uniqueId: '123' });
      const state = mainSlice(initialStateWithIngredients, action);
      expect(state.constructorItems.ingredients).toHaveLength(0);
    });
  
    it('should handle moveIngredientUp', () => {
      const initialStateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { _id: '1', name: 'Cheese', type: 'main', price: 50, uniqueId: '123' },
            { _id: '2', name: 'Salad', type: 'main', price: 30, uniqueId: '456' }
          ]
        }
      };
      const action = moveIngredientUp({ uniqueId: '456' });
      const state = mainSlice(initialStateWithIngredients, action);
      expect(state.constructorItems.ingredients[0].uniqueId).toBe('456');
      expect(state.constructorItems.ingredients[1].uniqueId).toBe('123');
    });
  
    it('should handle moveIngredientDown', () => {
      const initialStateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { _id: '1', name: 'Cheese', type: 'main', price: 50, uniqueId: '123' },
            { _id: '2', name: 'Salad', type: 'main', price: 30, uniqueId: '456' }
          ]
        }
      };
      const action = moveIngredientDown({ uniqueId: '123' });
      const state = mainSlice(initialStateWithIngredients, action);
      expect(state.constructorItems.ingredients[0].uniqueId).toBe('456');
      expect(state.constructorItems.ingredients[1].uniqueId).toBe('123');
    });
  
    it('should handle closeOrderRequest', () => {
      const initialStateWithOrder = {
        ...initialState,
        orderRequest: true,
        orderModalData: { number: 123 } as TOrder,
        constructorItems: {
          bun: { _id: '1', name: 'Bun', type: 'bun', price: 100 },
          ingredients: [{ _id: '2', name: 'Cheese', type: 'main', price: 50, uniqueId: '123' }]
        }
      };
      const action = closeOrderRequest();
      const state = mainSlice(initialStateWithOrder, action);
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toBeNull();
      expect(state.constructorItems.bun.price).toBe(0);
      expect(state.constructorItems.ingredients).toHaveLength(0);
    });
  
    it('should handle openModal and closeModal', () => {
      let state = mainSlice(initialState, openModal());
      expect(state.isModalOpened).toBe(true);
      
      state = mainSlice(state, closeModal());
      expect(state.isModalOpened).toBe(false);
    });
  
    it('should handle setErrorText and removeErrorText', () => {
      let state = mainSlice(initialState, setErrorText('Error occurred'));
      expect(state.errorText).toBe('Error occurred');
      
      state = mainSlice(state, removeErrorText());
      expect(state.errorText).toBe('');
    });
  });
  
  describe('mainSlice extraReducers', () => {
    it('should handle fetchIngredients.pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(true);
    });
  
    it('should handle fetchIngredients.fulfilled', () => {
      const mockIngredients = [{ _id: '1', name: 'Bun', type: 'bun', price: 100 }];
      const action = { type: fetchIngredients.fulfilled.type, payload: mockIngredients };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
    });
  
    it('should handle fetchNewOrder.pending', () => {
      const action = { type: fetchNewOrder.pending.type };
      const state = mainSlice(initialState, action);
      expect(state.orderRequest).toBe(true);
    });
  
    it('should handle fetchNewOrder.fulfilled', () => {
      const mockOrder = { order: { number: 123 } };
      const action = { type: fetchNewOrder.fulfilled.type, payload: mockOrder };
      const state = mainSlice(initialState, action);
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toEqual(mockOrder.order);
    });
  
    it('should handle fetchLoginUser.pending', () => {
      const action = { type: fetchLoginUser.pending.type };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(true);
    });
  
    it('should handle fetchLoginUser.fulfilled', () => {
      const mockResponse = { accessToken: 'token123', refreshToken: 'refresh123' };
      const action = { type: fetchLoginUser.fulfilled.type, payload: mockResponse };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(setCookie).toHaveBeenCalledWith('accessToken', 'token123');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh123');
    });
  
    it('should handle getUserThunk.fulfilled', () => {
      const mockUser = { user: { name: 'Test', email: 'test@test.com' } };
      const action = { type: getUserThunk.fulfilled.type, payload: mockUser };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser.user);
      expect(state.isAuthenticated).toBe(true);
    });
  
    it('should handle fetchLogout.fulfilled', () => {
      const initialStateWithUser = {
        ...initialState,
        user: { name: 'Test', email: 'test@test.com' },
        isAuthenticated: true
      };
      const action = { type: fetchLogout.fulfilled.type, payload: { success: true } };
      const state = mainSlice(initialStateWithUser, action);
      expect(state.loading).toBe(false);
      expect(state.user).toEqual({ name: '', email: '' });
      expect(state.isAuthenticated).toBe(false);
      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  
    it('should handle fetchUpdateUser.fulfilled', () => {
      const mockResponse = { success: true, user: { name: 'New Name', email: 'new@test.com' } };
      const action = { type: fetchUpdateUser.fulfilled.type, payload: mockResponse };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.user);
    });
  
    it('should handle fetchFeed.fulfilled', () => {
      const mockResponse = { orders: [{ id: 1 }], total: 100, totalToday: 10 };
      const action = { type: fetchFeed.fulfilled.type, payload: mockResponse };
      const state = mainSlice(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockResponse.orders);
      expect(state.totalOrders).toBe(mockResponse.total);
      expect(state.ordersToday).toBe(mockResponse.totalToday);
    });
  });
  
  describe('mainSlice async thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('fetchIngredients should call API and return data', async () => {
      const mockIngredients = [{ _id: '1', name: 'Bun', type: 'bun', price: 100 }];
      (getIngredientsApi as jest.Mock).mockResolvedValue(mockIngredients);
      
      const dispatch = jest.fn();
      const getState = jest.fn();
      const result = await fetchIngredients()(dispatch, getState, undefined);
      
      expect(getIngredientsApi).toHaveBeenCalled();
      expect(result.payload).toEqual(mockIngredients);
    });
  
    it('fetchNewOrder should call API with ingredients ids', async () => {
      const mockOrder = { order: { number: 123 } };
      (orderBurgerApi as jest.Mock).mockResolvedValue(mockOrder);
      
      const dispatch = jest.fn();
      const getState = jest.fn();
      const ingredients = ['1', '2'];
      const result = await fetchNewOrder(ingredients)(dispatch, getState, undefined);
      
      expect(orderBurgerApi).toHaveBeenCalledWith(ingredients);
      expect(result.payload).toEqual(mockOrder);
    });
  
    it('fetchLoginUser should handle successful login', async () => {
      const mockResponse = { accessToken: 'token123', refreshToken: 'refresh123' };
      (loginUserApi as jest.Mock).mockResolvedValue(mockResponse);
      
      const dispatch = jest.fn();
      const getState = jest.fn();
      const credentials = { email: 'test@test.com', password: 'password' };
      const result = await fetchLoginUser(credentials)(dispatch, getState, undefined);
      
      expect(loginUserApi).toHaveBeenCalledWith(credentials);
      expect(result.payload).toEqual(mockResponse);
    });
  
    it('getUserThunk should handle successful user fetch', async () => {
      const mockUser = { user: { name: 'Test', email: 'test@test.com' } };
      (getUserApi as jest.Mock).mockResolvedValue(mockUser);
      
      const dispatch = jest.fn();
      const getState = jest.fn();
      const result = await getUserThunk()(dispatch, getState, undefined);
      
      expect(getUserApi).toHaveBeenCalled();
      expect(result.payload).toEqual(mockUser);
    });
  });