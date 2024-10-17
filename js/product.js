class Product {
	constructor(id, name, price, description, image, storeId) {
		this.id = id;
		this.name = name;
		this.price = price;
		this.description = description;
		this.image = image;
		this.storeId = storeId;
		this.storeName = '';
	}

	render() {
		const productElement = document.createElement('div');
		productElement.classList.add('col');
		productElement.innerHTML = `
            <div class="card h-100">
                <img src="${this.image}" class="card-img-top" alt="${
			this.name
		}">
                <div class="card-body">
                    <h5 class="card-title">${this.name}</h5>
                    <p class="card-text">${this.description}</p>
                    <p class="card-text"><strong>Ksh.${this.price.toFixed(
											2
										)}</strong></p>
                    <p class="card-text"><small class="text-muted">Store: ${
											this.storeName
										}</small></p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="store.addToCart(${
											this.id
										})">Add to Cart</button>
                    <button class="btn btn-secondary btn-sm" onclick="store.updateProduct(${
											this.id
										}, {price: ${this.price + 10}})">Increase Price</button>
                    <button class="btn btn-danger btn-sm" onclick="store.deleteProduct(${
											this.id
										})">Delete</button>
                </div>
            </div>
        `;
		return productElement;
	}
}
