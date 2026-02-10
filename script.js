import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// Make functions global so HTML buttons can click them
window.editPlayer = (id, name, g, a, mp) => {
    const nG = prompt(`Update Goals for ${name}:`, g);
    const nA = prompt(`Update Assists for ${name}:`, a);
    const nMP = prompt(`Update Matches for ${name}:`, mp);
    if (nG !== null && nA !== null && nMP !== null) {
        update(ref(db, `players/${id}`), { goals: Number(nG), assists: Number(nA), matches: Number(nMP) });
    }
};

window.deletePlayer = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) remove(ref(db, `players/${id}`));
};

// Toggle UI based on Login Status
onAuthStateChanged(auth, (user) => {
    const isAlae = user && user.uid === 'NRYB6MgUoVP3bgl2fkkh2eTi8Sg1'; // Your UID
    document.getElementById('admin-panel').style.display = isAlae ? 'block' : 'none';
    document.getElementById('login-form').style.display = user ? 'none' : 'block';
    document.getElementById('btn-logout').style.display = user ? 'block' : 'none';
    document.getElementById('admin-header').style.display = isAlae ? 'table-cell' : 'none';
});

// Admin Login
document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } 
    catch (err) { alert("Error: " + err.message); }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

// Add Player
document.getElementById('btn-add').onclick = () => {
    const name = document.getElementById('p-name').value;
    if (name) {
        push(ref(db, 'players'), {
            name,
            matches: document.getElementById('p-matches').value || 0,
            goals: document.getElementById('p-goals').value || 0,
            assists: document.getElementById('p-assists').value || 0
        });
        document.getElementById('p-name').value = ''; // Clear input
    }
};

// Load Data and Build Table
onValue(ref(db, 'players'), (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    if (data) {
        const players = Object.keys(data).map(k => ({ id: k, ...data[k], ga: Number(data[k].goals) + Number(data[k].assists) }))
            .sort((a, b) => b.ga - a.ga);

        players.forEach((p, i) => {
            const adminCols = (auth.currentUser && auth.currentUser.uid === 'NRYB6MgUoVP3bgl2fkkh2eTi8Sg1') ? `<td>
                <button class="btn-edit" onclick="editPlayer('${p.id}','${p.name}',${p.goals},${p.assists},${p.matches})">Edit</button>
                <button class="btn-del" onclick="deletePlayer('${p.id}','${p.name}')">Delete</button>
            </td>` : '';
            
            tableBody.innerHTML += `<tr>
                <td>${i+1}</td>
                <td>${p.name}</td>
                <td>${p.matches}</td>
                <td>${p.goals}</td>
                <td>${p.assists}</td>
                <td class="highlight">${p.ga}</td>
                ${adminCols}
            </tr>`;
        });
    }
});