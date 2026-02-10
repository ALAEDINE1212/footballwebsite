// 1. Corrected CDN Imports for Browser Compatibility
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDOpMWxEuB74BkYXx0TqCqXEefEurSqRF0",
    authDomain: "football-306c0.firebaseapp.com",
    databaseURL: "https://football-306c0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "football-306c0",
    storageBucket: "football-306c0.firebasestorage.app",
    messagingSenderId: "783956701088",
    appId: "1:783956701088:web:fd770407aab845e3e4fec5"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// --- Admin Authentication Logic ---
const loginBtn = document.getElementById('btn-login');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            console.log("Logged in successfully!");
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });
}

const logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) {
    logoutBtn.onclick = () => signOut(auth);
}

// --- Watch Auth State (Show/Hide Admin UI) ---
onAuthStateChanged(auth, (user) => {
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('btn-logout');

    if (user) {
        adminPanel.style.display = 'block';
        loginForm.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
});

// --- Add Player Logic ---
const addBtn = document.getElementById('btn-add');
if (addBtn) {
    addBtn.onclick = () => {
        const name = document.getElementById('p-name').value;
        const matches = document.getElementById('p-matches').value;
        const goals = document.getElementById('p-goals').value;
        const assists = document.getElementById('p-assists').value;

        if(name) {
            push(ref(db, 'players'), {
                name: name,
                matches: matches || 0,
                goals: goals || 0,
                assists: assists || 0
            });
            // Clear inputs
            document.getElementById('p-name').value = '';
            document.getElementById('p-matches').value = '';
            document.getElementById('p-goals').value = '';
            document.getElementById('p-assists').value = '';
        }
    };
}

// --- Realtime Table Rendering ---
onValue(ref(db, 'players'), (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    if (data) {
        // Convert to array and calculate G+A
        const players = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            ga: Number(data[key].goals || 0) + Number(data[key].assists || 0)
        })).sort((a, b) => b.ga - a.ga); // Sort by highest G+A

        players.forEach((p, i) => {
            const isAdmin = auth.currentUser;
            tableBody.innerHTML += `
                <tr>
                    <td>${i+1}</td>
                    <td>${p.name}</td>
                    <td>${p.matches}</td>
                    <td>${p.goals}</td>
                    <td>${p.assists}</td>
                    <td class="highlight">${p.ga}</td>
                </tr>`;
        });
    }
});