import { IEvents } from '../base/events';
import {FormErrors, IContactsForm, IOrder, IOrderForm, IProductItem } from '../../types';

export class AppState {
	protected _basket: string[] = [];
	catalog: IProductItem[] = [];
	loading: boolean;
	order: Omit<IOrder, 'items'> = {
		email: '',
		phone: '',
		payment: '',
		address: '',
		total: 0,
	};

	preview: string | null;
	formErrors: FormErrors = {};
	events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	// Получить общую сумму в корзине
	getTotal(): number {
		return this._basket.reduce((total, id) => {
			const item = this.catalog.find((item) => item.id === id);
			return total + (item?.price || 0);
		}, 0);
	}

	// Запись в католог массив объектов
	setCatalog(items: IProductItem[]): void {
		this.catalog = items;
		this.events.emit('items:changed', { catalog: this.catalog });
	}

	// Добавление товара в корзину
	addToBasket(item: IProductItem): void {
		if (!this._basket.includes(item.id)) {
			this._basket.push(item.id);
			this.updateBasket();
		}
	}

	// Обновление корзины
	private updateBasket(): void {
		this.events.emit('basket:changed');
		this.events.emit('counter:updated', { basket: this._basket.length });
	}

	// Удаление товара из корзины
	removeFromBasket(id: string): void {
		this._basket = this._basket.filter((item) => item !== id);
		this.updateBasket();
	}

	// Очистка корзины
	clearBasket(): void {
		this._basket = [];
		this.updateBasket();
	}

	// Хранит ID товара в модальном окне
	setPreview(item: IProductItem): void {
		this.preview = item.id;
		this.events.emit('preview:changed', item);
	}

	// Валидация заказа
	validateOrder(): boolean {
		const errors: FormErrors = {};
		const isValid =
			this.order.payment &&
			this.order.address &&
			this.order.address.trim().length >= 5;

		if (!this.order.payment) errors.payment = 'Выберите способ оплаты';
		if (!this.order.address || this.order.address.trim().length < 5) {
			errors.address = 'Адрес должен содержать минимум 5 символов';
		}

		this.events.emit('formErrors:change', errors);
		return isValid;
	}

	// Валидация контактов
	validateContacts(): boolean {
		const errors: FormErrors = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const isValidEmail =
			!!this.order.email && emailRegex.test(this.order.email);
		const isValidPhone =
			!!this.order.phone && this.order.phone.replace(/\D/g, '').length >= 11;

		if (!isValidEmail) errors.email = 'Введите корректный email';
		if (!isValidPhone) errors.phone = 'Телефон должен содержать 11 цифр';

		this.events.emit('formErrors:change', errors);
		return isValidEmail && isValidPhone;
	}

	// Обновление полей заказа
	setOrderField(field: keyof IOrderForm | keyof IContactsForm, value: string) {
		if (field === 'payment' || field === 'address') {
			this.order[field] = value;
			this.validateOrder();
		} else if (field === 'email' || field === 'phone') {
			this.order[field] = value;
			this.validateContacts();
		}
	}

	// Геттер для basket
	get basket(): string[] {
		return this._basket;
	}

	// Формирование заказа
	getOrderData(): IOrder {
		return {
			...this.order,
			items: this._basket,
			total: this.getTotal(),
		};
	}
}