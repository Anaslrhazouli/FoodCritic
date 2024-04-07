import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, collection, doc  } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';

const restaurantForm = document.getElementById('restaurantForm');
const restaurantList = document.getElementById('restaurantList');
const firebaseConfig = {
  apiKey: "AIzaSyCO0E_JgSkgC9ZTj_ioPn3aBGxq39efBRM",
  authDomain: "food-critic-e3d14.firebaseapp.com",
  projectId: "food-critic-e3d14",
  storageBucket: "food-critic-e3d14.appspot.com",
  messagingSenderId: "1012255613844",
  appId: "1:1012255613844:web:5908382ce7de7fc3f6e581"
};
``
initializeApp(firebaseConfig);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const errorMsg = document.getElementById('errorMsg');
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
      const user = userCredential.user;
      console.log('User authenticated:', user);
      // Redirect or perform actions after successful authentication
    } catch (error) {
      console.error('Authentication failed:', error.message);
      errorMsg.innerHTML = `<span class="text-red-500">Authentication failed: Invalid Email or Password</span>`;      // Handle authentication failure, show an error message, etc.
    }
  });
});




window.addRestaurant = async function addRestaurant(restaurantData) {
  console.log('Adding restaurant with data:', restaurantData);
  try {
    console.log('Adding restaurant with data:', restaurantData);

    const response = await fetch('http://localhost:3000/resto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(restaurantData),
    });

    const result = await response.json();
    console.log('Add Restaurant Response:', result);
  } catch (error) {
    console.error('Error adding restaurant:', error);
  }
};

// trey




const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    console.log('clicked');
    try {
      await auth.signOut();
      console.log('User logged out successfully');
      window.location.reload();
      // Redirect to the home page or any other desired action
    } catch (error) {
      console.error('Error logging out:', error);
    }
  });
}
document.addEventListener('DOMContentLoaded', async () => {
  const userGreeting = document.getElementById('userGreeting');
  const restaurantList = document.getElementById('restaurantList');
  const connectBtn = document.getElementById('connectBtn');
  const addRestaurantBtn = document.getElementById('addRestaurantBtn');

  // Handle user authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      userGreeting.innerHTML = `Hello <span class="font-bold">${user.displayName || user.email}</span>`;
      userGreeting.classList.remove('hidden');
      logoutBtn.style.display = 'block'; // Show the logout button
      addRestaurantBtn.style.display = 'block'; // Show the logout button
      connectBtn.style.display = "none"
      console.log('User authenticated:', user);
    } else {
      logoutBtn.classList.add('hidden');
      addRestaurantBtn.classList.add('hidden');
      // User is signed out
      userGreeting.classList.add('hidden');
       // Add the 'hidden' class      // For demonstration purposes, let's log that the user is signed out
      console.log('User signed out');
    }
  });
  // Fetch and display existing restaurants
  await fetchAndDisplayRestaurants();

  // Handle form submission
  restaurantForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Extract data from the form
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const code_postal = document.getElementById('code_postal').value;

    // Validate the data (you can add more validation if needed)
    if (!name || !address || !code_postal) {
      alert('Please fill in all fields.');
      return;
    }

    // Send data to the server
    await addRestaurant({ name, address, code_postal });

    // Fetch and display the updated list of restaurants
    await fetchAndDisplayRestaurants();

    // Clear the form
    restaurantForm.reset();
  });

    async function fetchAndDisplayRestaurants() {
      try {
        console.log('Fetching restaurants...');
        const response = await fetch('http://localhost:3000/resto');
        const data = await response.json();
        console.log('Fetched data:', data);
    
        if (data.restaurants.length > 0) {
          restaurantList.innerHTML = '';
          data.restaurants.forEach(restaurant => {
            const li = document.createElement('li');
            li.classList.add('duration-300','hover:bg-gray-700','cursor-pointer','py-8', 'px-10', 'bg-gray-800', 'rounded-lg', 'shadow-md', 'mb-4','flex','justify-between','items-center');
    
            // Add a click event listener to each restaurant item
            li.addEventListener('click', () => {
              // Redirect to the reviews.html page with the restaurant ID in the query parameter
              window.location.href = `reviews.html?restaurantId=${restaurant.id}`;
            });
    
            li.innerHTML = `
            <div>
            <p class="text-3xl font-bold">${restaurant.name}</p>
            <p>${restaurant.address}</p>
            <p>${restaurant.code_postal}</p>
          </div>
          <button class="ml-2 text-red-700 hover:text-red-300 duration-300 focus:outline-none">
            <i class="fas fa-trash-alt"></i>
          </button>`;
            restaurantList.appendChild(li);
          });
        } else {
          console.log('No restaurants found.');
        }
      } catch (error) {
        console.error('Error fetching and displaying restaurants:', error);
      }
    }
});

const createAccountForm = document.getElementById('createAccountForm');

window.createUserAccount = async function createUserAccount(userData) {
  try {
    const { userName, userEmail, userPassword, userRole } = userData;

    // Create user account in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);

// Set display name in Firebase Authentication
await updateProfile(userCredential.user, { displayName: userName });

// Send user data to the server to create a new user in Firestore
const response = await fetch('http://localhost:3000/createUser', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: userName, email: userEmail, role: userRole }),
});

const result = await response.json();
console.log('User created successfully:', result);
  } catch (error) {
    console.error('Error creating user account:', error);
  }
};

createAccountForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Extract data from the form
  const userName = document.getElementById('userName').value;
  const userEmail = document.getElementById('userEmail').value;
  const userPassword = document.getElementById('userPassword').value;
  const userRole = document.getElementById('userRole').value;

  // Validate the data
  if (!userName || !userEmail || !userPassword || !userRole) {
    alert('Please fill in all fields.');
    return;
  }

  // Send data to the server
  await createUserAccount({ userName, userEmail, userPassword, userRole });

  // Clear the form
  createAccountForm.reset();
});


