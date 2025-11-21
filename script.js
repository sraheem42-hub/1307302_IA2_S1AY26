/* ===== USER LOGIN STATUS ===== */
function updateLoginStatus() {
    const statusEl = document.getElementById('user-status');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!statusEl) return;

    if (loggedInUser) {
        statusEl.innerHTML = `
            Signed in as <span class="signed-in">${loggedInUser.username}</span><br>
            <button class="logout-btn" onclick="logout()">Logout</button>
        `;
    } else {
        statusEl.innerHTML = `
            <span class="not-signed-in">Not signed in</span><br>
            <a href="login.html" class="login-link">Login</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    updateLoginStatus();
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

/* ===== ADD ITEM TO CART ===== */
function addToCart(name, price) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You must be logged in to add items.');
        window.location.href = 'login.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.name === name);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

/* ===== LOAD CART ===== */
function loadCart() {
    const cartTable = document.getElementById('cart-table');
    const totalEl = document.getElementById('total');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!cartTable || !totalEl) return;

    cartTable.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>$${subtotal.toFixed(2)}</td>
        `;
        cartTable.appendChild(row);
    });

    totalEl.textContent = `$${total.toFixed(2)}`;
}

/* ===== CLEAR CART ===== */
function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        localStorage.removeItem('cart');
        loadCart();
        alert('Cart cleared.');
    }
}

/* ===== CHECKOUT ===== */
function checkout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Show billing modal
    document.getElementById('billing-modal').style.display = 'flex';
}

function closeBillingModal() {
    document.getElementById('billing-modal').style.display = 'none';
}

/* ===== CONFIRM PAYMENT & SEND TO RECEIPT ===== */
function confirmPayment() {
    let name = document.getElementById('bill-name').value;
    let card = document.getElementById('bill-card').value;
    let exp = document.getElementById('bill-exp').value;
    let cvv = document.getElementById('bill-cvv').value;

    if (!name || !card || !exp || !cvv) {
        alert("Please complete all billing fields.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        closeBillingModal();
        return;
    }

    // Calculate total
    let total = 0;
    cart.forEach(item => total += item.price * item.qty);

    // Generate receipt ID
    function generateReceiptID() {
        const now = new Date();
        const datePart = now.getFullYear().toString() +
                         String(now.getMonth()+1).padStart(2,'0') +
                         String(now.getDate()).padStart(2,'0');
        const randomPart = Math.floor(10000 + Math.random() * 90000);
        return `RP-${datePart}-${randomPart}`;
    }

    // Save receipt to localStorage
    localStorage.setItem("receipt", JSON.stringify({
        id: generateReceiptID(),
        name: name,
        card: "**** **** **** " + card.slice(-4),
        date: new Date().toLocaleString(),
        cart: cart
    }));

    // Clear cart
    localStorage.removeItem('cart');
    loadCart();

    // Close modal
    closeBillingModal();

    // Redirect to receipt page
    window.location.href = "receipt.html";
}

/* ===== LOGIN ===== */
function login(username, password) {
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
    if (!registeredUser) {
        alert('No registered user found. Please register first.');
        window.location.href = 'register.html';
        return false;
    }

    if (username === registeredUser.username && password === registeredUser.password) {
        localStorage.setItem('loggedInUser', JSON.stringify({ username }));
        updateLoginStatus();
        alert('Login successful!');
        window.location.href = 'index.html';
        return true;
    } else {
        alert('Invalid username or password.');
        return false;
    }
}

/* ===== REGISTER ===== */
function register(fullname, dob, email, username, password) {
    const userAccount = { fullname, dob, email, username, password };
    localStorage.setItem('registeredUser', JSON.stringify(userAccount));
    localStorage.setItem('loggedInUser', JSON.stringify({ username }));
    alert('Account created successfully!');
    window.location.href = 'index.html';
}

/* ===== AUTO LOAD CART + LOGIN STATUS ===== */
document.addEventListener('DOMContentLoaded', function() {
    updateLoginStatus();
    if (document.getElementById('cart-table')) {
        loadCart();
    }
});
