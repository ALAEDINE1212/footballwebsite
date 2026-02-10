import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, update } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

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

// --- Admin Authentication ---
document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('admin-controls').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
    }
});

// --- Read & Display Data ---
const playersRef = ref(db, 'players');
onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    if (data) {
        // Convert object to array and calculate G+A
        let playersArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            ga: (parseInt(data[key].goals) || 0) + (parseInt(data[key].assists) || 0)
        }));

        // Sort by Goals (or G+A)
        playersArray.sort((a, b) => b.ga - a.ga);

        playersArray.forEach((player, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.matches}</td>
                    <td>${player.goals}</td>
                    <td>${player.assists}</td>
                    <td><strong>${player.ga}</strong></td>
                    ${auth.currentUser ? `<td><button onclick="editStats('${player.id}')">Edit</button></td>` : ''}
                </tr>`;
            tableBody.innerHTML += row;
        });
    }
});

// --- Write Data (Admin Only) ---
document.getElementById('btn-add').onclick = () => {
    const newPlayer = {
        name: document.getElementById('p-name').value,
        goals: document.getElementById('p-goals').value,
        assists: document.getElementById('p-assists').value,
        matches: document.getElementById('p-matches').value
    };
    push(ref(db, 'players'), newPlayer);
};