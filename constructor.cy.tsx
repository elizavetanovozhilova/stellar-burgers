/// <reference types="cypress" />

describe('Burger Constructor Tests', () => {
    beforeEach(() => {
      cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
      cy.intercept('POST', 'api/orders', { fixture: 'order.json' }).as('createOrder');
      
      // Мокируем авторизованного пользователя
      window.localStorage.setItem('accessToken', 'test-access-token');
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
      cy.intercept('GET', 'api/auth/user', {
        statusCode: 200,
        body: {
          success: true,
          user: {
            email: "test@example.com",
            name: "Test User"
          }
        }
      }).as('getUser');
      
      cy.visit('/');
      cy.wait('@getIngredients');
    });
  
    it('should load ingredients', () => {
      cy.get('[data-testid="ingredient-item"]').should('have.length', 3);
    });
  
    describe('Ingredient Modal Tests', () => {
      it('should open and close ingredient modal', () => {
        // Открытие модального окна
        cy.get('[data-testid="ingredient-item"]').first().click();
        cy.get('[data-testid="modal"]').should('exist');
        cy.get('[data-testid="ingredient-details-name"]').should('contain', 'Краторная булка N-200i');
        
        // Закрытие по крестику
        cy.get('[data-testid="modal-close-button"]').click();
        cy.get('[data-testid="modal"]').should('not.exist');
        
        // Закрытие по оверлею
        cy.get('[data-testid="ingredient-item"]').first().click();
        cy.get('[data-testid="modal-overlay"]').click({ force: true });
        cy.get('[data-testid="modal"]').should('not.exist');
      });
    });
  
    describe('Constructor Tests', () => {
      it('should add bun to constructor', () => {
        const dataTransfer = new DataTransfer();
        
        cy.get('[data-testid="ingredient-item"]').first()
          .trigger('dragstart', { dataTransfer });
        
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        cy.get('[data-testid="constructor-bun-top"]').should('contain', 'Краторная булка N-200i');
        cy.get('[data-testid="constructor-bun-bottom"]').should('contain', 'Краторная булка N-200i');
      });
  
      it('should add main ingredient to constructor', () => {
        const dataTransfer = new DataTransfer();
        
        cy.get('[data-testid="ingredient-item"]').eq(1)
          .trigger('dragstart', { dataTransfer });
        
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        cy.get('[data-testid="constructor-item"]').should('contain', 'Биокотлета из марсианской Магнолии');
      });
  
      it('should remove ingredient from constructor', () => {
        // Добавляем ингредиент
        const dataTransfer = new DataTransfer();
        cy.get('[data-testid="ingredient-item"]').eq(1)
          .trigger('dragstart', { dataTransfer });
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        // Удаляем ингредиент
        cy.get('[data-testid="constructor-item"] [data-testid="remove-ingredient"]').click();
        cy.get('[data-testid="constructor-item"]').should('not.exist');
      });
    });
  
    describe('Order Creation Tests', () => {
      it('should create and display order', () => {
        // Добавляем булку и ингредиент
        const dataTransfer = new DataTransfer();
        
        // Булки
        cy.get('[data-testid="ingredient-item"]').first()
          .trigger('dragstart', { dataTransfer });
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        // Начинка
        dataTransfer.clearData();
        cy.get('[data-testid="ingredient-item"]').eq(1)
          .trigger('dragstart', { dataTransfer });
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        // Оформляем заказ
        cy.get('[data-testid="order-button"]').click();
        cy.wait('@createOrder');
        
        // Проверяем модальное окно заказа
        cy.get('[data-testid="order-modal"]').should('exist');
        cy.get('[data-testid="order-number"]').should('contain', '12345');
        
        // Закрываем модальное окно
        cy.get('[data-testid="modal-close-button"]').click();
        cy.get('[data-testid="order-modal"]').should('not.exist');
        
        // Проверяем, что конструктор очистился
        cy.get('[data-testid="constructor-bun-top"]').should('not.exist');
        cy.get('[data-testid="constructor-item"]').should('not.exist');
      });
  
      it('should not create order without bun', () => {
        // Добавляем только начинку
        const dataTransfer = new DataTransfer();
        cy.get('[data-testid="ingredient-item"]').eq(1)
          .trigger('dragstart', { dataTransfer });
        cy.get('[data-testid="constructor-drop-area"]')
          .trigger('drop', { dataTransfer })
          .trigger('dragend');
        
        // Пытаемся оформить заказ
        cy.get('[data-testid="order-button"]').click();
        
        // Проверяем, что модальное окно не открылось
        cy.get('[data-testid="order-modal"]').should('not.exist');
        // Можно добавить проверку на сообщение об ошибке
      });
    });
  });