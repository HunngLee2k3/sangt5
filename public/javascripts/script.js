// public/javascripts/script.js
async function addToCart(productId) {
    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (response.ok) {
            const message = document.getElementById('cart-message');
            message.classList.remove('d-none');
            setTimeout(() => {
                message.classList.add('d-none');
            }, 3000);
            const countResponse = await fetch('/cart/count');
            const countData = await countResponse.json();
            if (countData.success) {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = countData.count;
                }
            }
        } else {
            const errorData = await response.json();
            alert('Không thể thêm sản phẩm vào giỏ hàng: ' + (errorData.message || 'Lỗi không xác định'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi khi thêm sản phẩm vào giỏ hàng: ' + error.message);
    }
}

async function updateQuantity(input) {
    const productId = input.dataset.productId;
    const quantity = parseInt(input.value);
    if (quantity < 1) {
        input.value = 1;
        return;
    }
    try {
        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });
        if (response.ok) {
            const message = document.getElementById('cart-message');
            message.classList.remove('d-none');
            setTimeout(() => {
                message.classList.add('d-none');
            }, 3000);
            const cartResponse = await fetch('/cart/count');
            const countData = await cartResponse.json();
            if (countData.success) {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = countData.count;
                }
            }
            const cart = await (await fetch('/cart/view-data')).json();
            const total = cart.items.reduce((sum, item) => sum + (item.productId && item.productId.price ? item.productId.price * item.quantity : 0), 0);
            document.getElementById('cart-total').textContent = `${total} VND`;
        } else {
            const errorData = await response.json();
            alert('Không thể cập nhật số lượng: ' + (errorData.message || 'Lỗi không xác định'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi khi cập nhật số lượng: ' + error.message);
    }
}

async function removeFromCart(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?')) {
        try {
            const response = await fetch('/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert('Không thể xóa sản phẩm: ' + (errorData.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    }
}

async function removeFromCartByIndex(index) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?')) {
        try {
            const response = await fetch('/cart/remove-by-index', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert('Không thể xóa sản phẩm: ' + (errorData.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    }
}