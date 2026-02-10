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

const ADMIN_UID = 'NRYB6MgUoVP3bgl2fkkh2eTi8Sg1';

window.editPlayer = (id, name, w, g, a, mp) => {
    const nW = prompt(`Wins for ${name}:`, w);
    const nG = prompt(`Goals for ${name}:`, g);
    const nA = prompt(`Assists for ${name}:`, a);
    const nMP = prompt(`Matches for ${name}:`, mp);
    if (nW !== null && nG !== null && nA !== null && nMP !== null) {
        update(ref(db, `players/${id}`), { 
            wins: Number(nW), goals: Number(nG), assists: Number(nA), matches: Number(nMP) 
        });
    }
};

window.deletePlayer = (id, name) => {
    if (confirm(`Delete ${name}?`)) remove(ref(db, `players/${id}`));
};

onAuthStateChanged(auth, (user) => {
    const isAlae = user && user.uid === ADMIN_UID;
    document.getElementById('admin-panel').style.display = isAlae ? 'block' : 'none';
    document.getElementById('login-form').style.display = user ? 'none' : 'block';
    document.getElementById('btn-logout').style.display = user ? 'block' : 'none';
    document.getElementById('admin-header').style.display = isAlae ? 'table-cell' : 'none';
});

document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } 
    catch (err) { alert(err.message); }
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

document.getElementById('btn-add').onclick = () => {
    const name = document.getElementById('p-name').value;
    if (name) {
        push(ref(db, 'players'), {
            name,
            wins: Number(document.getElementById('p-wins').value) || 0,
            matches: Number(document.getElementById('p-matches').value) || 0,
            goals: Number(document.getElementById('p-goals').value) || 0,
            assists: Number(document.getElementById('p-assists').value) || 0
        });
        document.getElementById('p-name').value = '';
    }
};

onValue(ref(db, 'players'), (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    if (data) {
        const players = Object.keys(data).map(k => ({
            id: k,
            ...data[k],
            points: (Number(data[k].wins) || 0) * 3
        })).sort((a, b) => b.points - a.points || b.goals - a.goals);

        players.forEach((p, i) => {
            const isAlae = auth.currentUser && auth.currentUser.uid === ADMIN_UID;
            const adminCols = isAlae ? `<td>
                <button class="btn-edit" onclick="editPlayer('${p.id}','${p.name}',${p.wins || 0},${p.goals},${p.assists},${p.matches})">Edit</button>
                <button class="btn-del" onclick="deletePlayer('${p.id}','${p.name}')">Delete</button>
            </td>` : '';
            
            tableBody.innerHTML += `<tr>
                <td>${i+1}</td>
                <td>${p.name}</td>
                <td>${p.matches}</td>
                <td>${p.wins || 0}</td>
                <td>${p.goals}</td>
                <td>${p.assists}</td>
                <td class="highlight">${p.points}</td>
                ${adminCols}
            </tr>`;
        });
    }
});