class Cart {
	constructor() {
		this.items = [];
	}

	addItem(product) {
		if (!product) {
			alert('Product does not exist!');
			return;
		}
		const existingItem = this.items.find(
			(item) => item.product.id === product.id
		);
		if (existingItem) {
			existingItem.quantity++;
		} else {
			this.items.push({ product, quantity: 1 });
		}
		this.updateCart();
	}

	removeItem(productId) {
		const index = this.items.findIndex((item) => item.product.id === productId);
		if (index !== -1) {
			if (confirm('Are you sure you want to remove this item?')) {
				if (this.items[index].quantity > 1) {
					this.items[index].quantity--;
				} else {
					this.items.splice(index, 1);
				}
				this.updateCart();
			}
		} else {
			alert('Item not found in the cart!');
		}
	}

	updateCart() {
		const cartItemsElement = document.getElementById('cart-items');
		const cartTotalElement = document.getElementById('cart-total');

		cartItemsElement.innerHTML = '';
		let total = 0;

		this.items.forEach((item) => {
			const li = document.createElement('li');
			li.classList.add(
				'list-group-item',
				'd-flex',
				'justify-content-between',
				'align-items-center'
			);
			li.innerHTML = `
                <div>
                    <h6 class="my-0">${item.product.name}</h6>
                    <small class="text-muted">Ksh. ${item.product.price.toFixed(
											2
										)} x ${item.quantity}</small>
                </div>
                <span>Ksh. ${(item.product.price * item.quantity).toFixed(
									2
								)}</span>
                <button class="btn btn-danger btn-sm" onclick="store.removeFromCart(${
									item.product.id
								})">Remove</button>
            `;
			cartItemsElement.appendChild(li);
			total += item.product.price * item.quantity;
		});

		cartTotalElement.textContent = `Ksh. ${total.toFixed(2)}`;
	}
}

class Store {
	constructor() {
		this.products = [];
		this.stores = [];
		this.cart = new Cart();
		this.orderHistory = [];
		this.storeMap = new Map();
	}

	async fetchProducts() {
		try {
			const response = await fetch(
				'https://electronic-shop-gvkm.onrender.com/products'
			);
			const data = await response.json();
			this.products = data.map(
				(item) =>
					new Product(
						item.id,
						item.name,
						item.price,
						item.description,
						item.image,
						item.storeId
					)
			);
			this.displayProducts();
		} catch (error) {
			console.error('Error fetching products:', error);
			this.showAlert(
				'Error fetching products. Please try again later.',
				'danger'
			);
		}
	}

	async fetchStores() {
		try {
			const response = await fetch(
				'https://electronic-shop-gvkm.onrender.com/stores'
			);
			this.stores = await response.json();
			this.storeMap = new Map(
				this.stores.map((store) => [store.id, store.name])
			);
			this.updateStoreSelect();
		} catch (error) {
			console.error('Error fetching stores:', error);
			this.showAlert(
				'Error fetching stores. Please try again later.',
				'danger'
			);
		}
	}

	displayProducts(products = this.products) {
		const productGridElement = document.getElementById('product-grid');
		productGridElement.innerHTML = '';
		products.forEach((product) => {
			product.storeName = this.storeMap.get(product.storeId) || 'Unknown Store';
			productGridElement.appendChild(product.render());
		});
	}

	async deleteProduct(productId) {
		const confirmed = confirm('Are you sure you want to delete this product?');
		if (!confirmed) {
			this.showAlert('Product deletion cancelled.', 'info');
			return;
		}

		try {
			const response = await fetch(
				`https://electronic-shop-gvkm.onrender.com/products/${productId}`,
				{
					method: 'DELETE',
				}
			);
			if (response.ok) {
				this.products = this.products.filter(
					(product) => product.id !== productId
				);
				this.displayProducts();
				this.showAlert('Product deleted successfully!', 'success');
			} else {
				throw new Error('Failed to delete product');
			}
		} catch (error) {
			console.error('Error deleting product:', error);
			this.showAlert('Error deleting product. Please try again.', 'danger');
		}
	}

	searchProducts(query) {
		query = query.toLowerCase().trim();
		const filteredProducts = this.products.filter(
			(product) =>
				product.name.toLowerCase().includes(query) ||
				product.description.toLowerCase().includes(query) ||
				this.storeMap.get(product.storeId).toLowerCase().includes(query) ||
				product.price.toString().includes(query)
		);

		if (filteredProducts.length === 0) {
			this.showAlert('No products found!', 'warning');
		} else {
			this.showAlert(`Found ${filteredProducts.length} product(s)`, 'success');
		}
		this.displayProducts(filteredProducts);
	}

	updateStoreSelect() {
		const storeSelect = document.getElementById('product-store');
		storeSelect.innerHTML = '<option value="">Select a store</option>';
		this.stores.forEach((store) => {
			const option = document.createElement('option');
			option.value = store.id;
			option.textContent = store.name;
			storeSelect.appendChild(option);
		});
	}

	addToCart(productId) {
		const product = this.products.find((p) => p.id === productId);
		if (product) {
			this.cart.addItem(product);
			this.showAlert(`${product.name} added to cart!`, 'success');
		} else {
			this.showAlert('Product not found!', 'danger');
		}
	}

	removeFromCart(productId) {
		this.cart.removeItem(productId);
	}

	async addProduct(product) {
		if (
			!product.name ||
			!product.price ||
			isNaN(product.price) ||
			!product.image
		) {
			this.showAlert('Please fill in all fields with valid data.', 'warning');
			return;
		}

		const imageInput = document.getElementById('product-image');
		const file = imageInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.onloadend = async () => {
				product.image = reader.result;

				try {
					const response = await fetch(
						'https://electronic-shop-gvkm.onrender.com/products',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(product),
						}
					);
					const newProduct = await response.json();
					this.products.push(
						new Product(
							newProduct.id,
							newProduct.name,
							newProduct.price,
							newProduct.description,
							newProduct.image,
							newProduct.storeId
						)
					);
					this.displayProducts();
					this.showAlert('Product added successfully!', 'success');
				} catch (error) {
					console.error('Error adding product:', error);
					this.showAlert('Error adding product. Please try again.', 'danger');
				}
			};

			reader.readAsDataURL(file);
		} else {
			this.showAlert('No image selected!', 'warning');
		}
	}

	showAlert(message, type) {
		const alertElement = document.createElement('div');
		alertElement.className = `alert alert-${type} alert-dismissible fade show`;
		alertElement.role = 'alert';
		alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
		document.body.insertBefore(alertElement, document.body.firstChild);
		setTimeout(() => alertElement.remove(), 5000);
	}

	async addStore(store) {
		try {
			const response = await fetch(
				'https://electronic-shop-gvkm.onrender.com/stores',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(store),
				}
			);
			const newStore = await response.json();
			this.stores.push(newStore);
			this.storeMap.set(newStore.id, newStore.name);
			this.updateStoreSelect();
			this.showAlert('Store added successfully!', 'success');
		} catch (error) {
			console.error('Error adding store:', error);
			this.showAlert('Error adding store. Please try again.', 'danger');
		}
	}

	placeOrder() {
		if (this.cart.items.length === 0) {
			this.showAlert('Your cart is empty!', 'warning');
			return;
		}
		const newOrder = {
			id: Date.now(),
			items: [...this.cart.items],
			total: this.cart.items.reduce(
				(sum, item) => sum + item.product.price * item.quantity,
				0
			),
			date: new Date(),
		};
		this.orderHistory.push(newOrder);
		this.showAlert('Order placed successfully!', 'success');
		this.cart.items = [];
		this.cart.updateCart();
		this.renderOrderHistory();
	}
	renderOrderHistory() {
		const orderHistoryList = document.getElementById('order-history-list');
		orderHistoryList.innerHTML = '';

		this.orderHistory.forEach((order) => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${order.id}</td>
				<td>${new Date(order.date).toLocaleString()}</td>
				<td>Ksh. ${order.total.toFixed(2)}</td>
				<td>Pending payment...</td> 
			`;
			orderHistoryList.appendChild(row);
		});
	}
}

const store = new Store();

store.fetchStores().then(() => {
	store.fetchProducts();
});

document.getElementById('search-button').addEventListener('click', () => {
	const searchQuery = document.getElementById('search-input').value;
	store.searchProducts(searchQuery);
});

document.getElementById('search-input').addEventListener('input', (event) => {
	const searchQuery = event.target.value;
	if (searchQuery.length >= 3 || searchQuery.length === 0) {
		store.searchProducts(searchQuery);
	}
});

document.getElementById('product-grid').addEventListener('click', (event) => {
	if (event.target.classList.contains('delete-product')) {
		const productId = parseInt(event.target.dataset.productId);
		if (confirm('Are you sure you want to delete this product?')) {
			store.deleteProduct(productId);
		}
	}
});

document
	.getElementById('place-order-button')
	.addEventListener('click', () => store.placeOrder());

document
	.getElementById('add-product-form')
	.addEventListener('submit', (event) => {
		event.preventDefault();
		const newProduct = {
			name: document.getElementById('product-name').value,
			price: parseFloat(document.getElementById('product-price').value),
			description: document.getElementById('product-description').value,
			image: document.getElementById('product-image').value,
			storeId: parseInt(document.getElementById('product-store').value),
		};
		store.addProduct(newProduct);
		event.target.reset();
	});

document
	.getElementById('add-store-form')
	.addEventListener('submit', (event) => {
		event.preventDefault();
		const newStore = {
			name: document.getElementById('store-name').value,
			location: document.getElementById('store-location').value,
		};
		store.addStore(newStore);
		event.target.reset();
	});
