import { IEvents } from './../base/events';
import { Component } from '../base/components';
import { ensureElement } from '../../utils/utils';
import { IFormState } from '../../types';

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);

		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		// Установка начального состояния
		this.valid = false;

		// Поля для ошибок
		this.errors = '';

		// Обработчик событий при вводе
		this.container.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});
		// Обработчик событий при отправке
		this.container.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	// Реагируем на изменения данных в форме
	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	// Управляет состоянием кнопки
	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	// Устанавливает текст ошибки
	set errors(value: string) {
		this.setText(this._errors, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}