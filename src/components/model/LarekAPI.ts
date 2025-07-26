import { Api, ApiListResponse } from '../base/api';
import { ILarekAPI, IOrder, IOrderResult, IProductItem } from '../../types';


export class LarekAPI extends Api implements ILarekAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	// Получение массива объектов с сервера
	getItems(): Promise<IProductItem[]> {
		return this.get('/product')
			.then((data: ApiListResponse<IProductItem>) =>
				data.items.map((item) => ({
				...item,
				image: this.cdn + item.image
				}))
			)
	}

	// Отправление заказа
	orderItems(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order)
			.then((data: IOrderResult) => data);
	}
}