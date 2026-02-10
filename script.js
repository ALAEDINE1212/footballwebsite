import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDOpMWxEuB74BkYXx0TqCqXEefEurSqRF0",
    authDomain: "football-306c0.firebaseapp.com",
    databaseURL: "https://football-306c0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "football-306c0",
    storageBucket: "football-306c0.firebasestorage.app",
    messagingSenderId: "783956701088",
    appId: "1:783956701088:web:fd770407aab845e3e4fec5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// --- Handle Login ---
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});

// --- Handle Logout ---
document.getElementById('btn-logout').onclick = () => signOut(auth);

// --- Check Login State ---
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

// --- Add Player ---
document.getElementById('btn-add').onclick = () => {
    const player = {
        name: document.getElementById('p-name').value,
        matches: document.getElementById('p-matches').value,
        goals: document.getElementById('p-goals').value,
        assists: document.getElementById('p-assists').value
    };
    push(ref(db, 'players'), player);
};

// --- Render Table ---
onValue(ref(db, 'players'), (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    if (data) {
        const players = Object.values(data).map(p => ({
            ...p,
            ga: Number(p.goals) + Number(p.assists)
        })).sort((a, b) => b.ga - a.ga);

        players.forEach((p, i) => {
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