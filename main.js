// Buy/Sell Tab Toggle
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    tabContents[index].classList.add('active');
  });
});

// Hamburger / Mobile Nav
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav ul');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// FAQ Accordion
const faqButtons = document.querySelectorAll('.faq-btn');

faqButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const content = btn.nextElementSibling;
    content.style.display = (content.style.display === 'block') ? 'none' : 'block';
  });
});

// Fetch Prices from CoinGecko API
async function fetchPrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,usd-coin&vs_currencies=cad');
    const data = await res.json();

    const btcPrice = data.bitcoin.cad;
    const usdcPrice = data['usd-coin'].cad;

    document.getElementById('btc-rate').textContent = `1 BTC = CAD ${btcPrice}`;
    document.getElementById('usdc-rate').textContent = `1 USDC = CAD ${usdcPrice}`;

    document.getElementById("cadAmount").addEventListener("input", function () {
      const cad = parseFloat(this.value);
      const selected = document.getElementById("cryptoSelect").value;
      let cryptoAmount = 0;

      if (selected === "btc") {
        cryptoAmount = cad / btcPrice;
      } else if (selected === "usdc") {
        cryptoAmount = cad / usdcPrice;
      }

      document.getElementById("cryptoAmount").value = cryptoAmount.toFixed(6);
    });

  } catch (err) {
    console.error("Error fetching price:", err);
  }
}

fetchPrices();
setInterval(fetchPrices, 60000); // refresh every 1 min

// Form Submission to Node.js backend
async function submitFormToNode(data) {
  try {
    const response = await fetch("http://localhost:3000/submit", {  // Change this URL to your backend endpoint
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.ok;
  } catch (error) {
    console.error("Error submitting form:", error);
    return false;
  }
}

// Fix and clean the form submission event
const form = document.getElementById('cryptoForm');
const submitBtn = document.querySelector('button[type="submit"]');
const status = document.getElementById("statusMessage");

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  submitBtn.disabled = true;
  status.textContent = "Submitting...";

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    coin: document.getElementById('cryptoSelect').value,
    amount: document.getElementById('cadAmount').value,
    wallet: document.getElementById('wallet').value,
    type: document.querySelector('input[name="type"]:checked').value,
    paymentProof: document.getElementById('paymentProof').value // Only file name, not full file
  };

  const success = await submitFormToNode(formData);

  if (success) {
    form.reset();
    status.textContent = "Submitted successfully!";
  } else {
    status.textContent = "Submission failed. Try again.";
  }

  submitBtn.disabled = false; // Re-enable submit button after submission
});

// Show bank details based on selected coin
function showBankDetails(type) {
  const bankDiv = document.getElementById("bankTransferDetails");

  if (type === "btc") {
    document.getElementById("bankName").textContent = "Bank Name: Your BTC Bank";
    document.getElementById("accountNumber").textContent = "Account Number: 1234567890";
    document.getElementById("accountType").textContent = "Account Type: CAD BTC Account";
    document.getElementById("transferMethod").textContent = "Transfer Method: Wire Transfer or Interac e-Transfer";
    document.getElementById("swiftCode").textContent = "SWIFT/BIC Code: SWIFT1234";
    document.getElementById("additionalInfo").textContent = "Additional Info: Please include reference 'BTC-Transfer'.";
  } else if (type === "usdc") {
    document.getElementById("bankName").textContent = "Bank Name: Your USDC Bank";
    document.getElementById("accountNumber").textContent = "Account Number: 0987654321";
    document.getElementById("accountType").textContent = "Account Type: CAD USDC Account";
    document.getElementById("transferMethod").textContent = "Transfer Method: Wire Transfer or Interac e-Transfer";
    document.getElementById("swiftCode").textContent = "SWIFT/BIC Code: SWIFT5678";
    document.getElementById("additionalInfo").textContent = "Additional Info: Please include reference 'USDC-Transfer'.";
  }

  bankDiv.style.display = "block";
}

// Wallet Input Validation
document.getElementById("wallet").addEventListener("input", function () {
  const walletAddress = this.value.trim();
  const selectedWallet = document.getElementById("cryptoSelect").value;
  const errorDiv = document.getElementById("invalidWalletMessage");
  const bankDiv = document.getElementById("bankTransferDetails");

  errorDiv.style.display = "none";
  bankDiv.style.display = "none";

  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const usdcRegex = /^0x[a-fA-F0-9]{40}$/;

  if (selectedWallet === "btc" && btcRegex.test(walletAddress)) {
    errorDiv.style.display = "none";
    showBankDetails("btc");
  } else if (selectedWallet === "usdc" && usdcRegex.test(walletAddress)) {
    errorDiv.style.display = "none";
    showBankDetails("usdc");
  } else {
    errorDiv.style.display = "block";
  }
});

// Function to handle Buy/Sell transactions
function handleTrade(type) {
  let cryptoSelect, amountInput, priceInput, totalInput;

  if (type === 'buy') {
    cryptoSelect = document.getElementById('buy-crypto');
    amountInput = document.getElementById('buy-amount');
    priceInput = document.getElementById('buy-price');
    totalInput = document.getElementById('buy-total');
  } else if (type === 'sell') {
    cryptoSelect = document.getElementById('sell-crypto');
    amountInput = document.getElementById('sell-amount');
    priceInput = document.getElementById('sell-price');
    totalInput = document.getElementById('sell-total');
  }

  const crypto = cryptoSelect.value;
  const amount = parseFloat(amountInput.value);
  const price = parseFloat(priceInput.value);

  if (!amount || !price) {
    alert("Please enter both amount and price.");
    return;
  }

  const total = amount * price;
  totalInput.value = total.toFixed(2); // Set the total

  // Here, you would handle the trade transaction (e.g., submit form, send API request)
  alert(`${type.charAt(0).toUpperCase() + type.slice(1)} order placed for ${amount} ${crypto} at ${price} CAD each. Total: ${total.toFixed(2)} CAD.`);
}


// Handle wallet address validation and form submission
document.getElementById("wallet").addEventListener("input", function () {
  const walletAddress = this.value.trim();
  const selectedWallet = document.getElementById("cryptoSelect").value;
  const errorDiv = document.getElementById("invalidWalletMessage");
  const bankTransferInfo = document.getElementById("bankTransferInfo");

  // Clear the error message when the wallet input changes
  errorDiv.style.display = "none";

  // Example condition to allow testing with non-valid addresses
  const exampleAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Example Bitcoin address

  // Allow non-empty or example address for testing purposes
  if (walletAddress === exampleAddress) {
    errorDiv.style.display = "none";
    bankTransferInfo.style.display = "block"; // Show bank transfer info if the example address is used
    return; // Skip validation if it's the example address
  }

  // Regex for valid BTC and USDC wallet addresses
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const usdcRegex = /^0x[a-fA-F0-9]{40}$/;

  // Validate if the address matches the selected coin type (BTC or USDC)
  if ((selectedWallet === "btc" && btcRegex.test(walletAddress)) || 
      (selectedWallet === "usdc" && usdcRegex.test(walletAddress))) {
    errorDiv.style.display = "none";
    bankTransferInfo.style.display = "block"; // Show bank transfer info when valid address
  } else {
    errorDiv.style.display = "block"; // Show error if wallet address is invalid
    bankTransferInfo.style.display = "none"; // Hide bank transfer info if wallet is invalid
  }
});


document.getElementById('registration-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email2').value.trim(); // Changed from 'email' to 'email2'
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  let isValid = true;

  // ✅ Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    alert('🚫 Invalid email address. Make sure it looks like: example@gmail.com');
    isValid = false;
  }

  // ✅ Phone number validation (Nigerian + International formats)
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    alert('🚫 Invalid phone number. Use format like +234xxxxxxxxxx or 11-digit number.');
    isValid = false;
  }

  // 🔐 Password strength check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{10,}$/;
  if (!passwordRegex.test(password)) {
    document.getElementById('password-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('password-error').style.display = 'none';
  }

  // 👯‍♀️ Password match check
  if (password !== confirmPassword) {
    document.getElementById('password-match-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('password-match-error').style.display = 'none';
  }

  if (isValid) {
    alert('✅ Registration successful.');
  }
});


document.getElementById('registration-form').addEventListener('submit', function(e) {
  e.preventDefault();

  let email = document.getElementById('email2').value;
  let phone = document.getElementById('phone').value;
  let password = document.getElementById('password').value;
  let confirmPassword = document.getElementById('confirm-password').value;

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  if (!password.match(passwordRegex)) {
    document.getElementById('password-error').style.display = 'block';
    return;
  }

  // Password match check
  if (password !== confirmPassword) {
    document.getElementById('password-match-error').style.display = 'block';
    return;
  }

  // Store user data in localStorage
  const userData = {
    email: email,
    phone: phone,
    password: password
  };
  
  localStorage.setItem('user', JSON.stringify(userData)); // Store the user in localStorage

  // Redirect to login or dashboard page
  window.location.href = "signin.html";
});


document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  let email = document.getElementById('login-email').value;
  let password = document.getElementById('login-password').value;

  // Retrieve user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    // If the login is successful, redirect to the Buy/Sell page
    sessionStorage.setItem('loggedIn', true); // Set login status in sessionStorage
    window.location.href = "buy-sell.html"; // Redirect to the buy/sell page
  } else {
    alert("Invalid email or password.");
  }
});


if (!sessionStorage.getItem('loggedIn')) {
  alert("You must log in to perform this action.");
  window.location.href = "signin.html"; // Redirect to login page
}


// Protect page - only logged in users can access
document.addEventListener("DOMContentLoaded", function () {
  const loggedIn = localStorage.getItem("isLoggedIn");
  if (loggedIn !== "true") {
    window.location.href = "login.html"; // or homepage with your login form
  }
});
