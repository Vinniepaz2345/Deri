const APP_ID = "70074"; // Replace with your Deriv App ID
const API_URL = "wss://ws.deriv.com/websockets/v3";
const REDIRECT_URL = "https://vinniepaz2345.github.io/Deri/"; // Replace with your redirect URL

let loginBtn = document.getElementById("loginBtn");
let logoutBtn = document.getElementById("logoutBtn");
let depositBtn = document.getElementById("depositBtn");
let withdrawBtn = document.getElementById("withdrawBtn");
let userName = document.getElementById("userName");
let balanceEl = document.getElementById("balance");
let transactionList = document.getElementById("transactionList");
let userDetails = document.getElementById("userDetails");

let ws;
let authToken = localStorage.getItem("deriv_token");

// Function to initiate WebSocket connection
function connectDeriv(token) {
    ws = new WebSocket(API_URL);

    ws.onopen = () => {
        console.log("Connected to Deriv API");
        ws.send(JSON.stringify({ authorize: token }));
    };

    ws.onmessage = (event) => {
        let data = JSON.parse(event.data);
        
        if (data.msg_type === "authorize") {
            console.log("Authorized:", data.authorize);
            userName.textContent = data.authorize.full_name;
            balanceEl.textContent = `$${data.authorize.balance}`;
            userDetails.style.display = "block";
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
        } else if (data.msg_type === "balance") {
            balanceEl.textContent = `$${data.balance.balance}`;
        } else if (data.msg_type === "cashier") {
            window.open(data.cashier, "_blank");
        }
    };

    ws.onerror = (error) => console.error("WebSocket Error:", error);
    ws.onclose = () => console.log("Disconnected from API");
}

// Function to log in using OAuth
loginBtn.addEventListener("click", () => {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`;
});

// Function to log out
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("deriv_token");
    window.location.reload();
});

// Check if user is already logged in
if (authToken) {
    connectDeriv(authToken);
}

// Handle URL token after login
if (window.location.search.includes("token")) {
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");
    localStorage.setItem("deriv_token", token);
    window.history.replaceState({}, document.title, "/"); // Clean URL
    connectDeriv(token);
}

// Handle deposit
depositBtn.addEventListener("click", () => {
    let amount = prompt("Enter deposit amount (Min: $0.35):");
    if (amount && parseFloat(amount) >= 0.35) {
        processTransaction("deposit");
    } else {
        alert("Minimum deposit is $0.35");
    }
});

// Handle withdraw
withdrawBtn.addEventListener("click", () => {
    let amount = prompt("Enter withdrawal amount:");
    if (amount && parseFloat(amount) > 0) {
        processTransaction("withdraw");
    } else {
        alert("Enter a valid amount");
    }
});

// Function to process transactions
function processTransaction(type) {
    ws.send(JSON.stringify({ cashier: type }));
                           }
