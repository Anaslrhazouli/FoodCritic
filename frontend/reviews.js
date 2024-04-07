// reviews.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, collection, doc  } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getDoc,getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
const firebaseConfig = {
  apiKey: "AIzaSyCO0E_JgSkgC9ZTj_ioPn3aBGxq39efBRM",
  authDomain: "food-critic-e3d14.firebaseapp.com",
  projectId: "food-critic-e3d14",
  storageBucket: "food-critic-e3d14.appspot.com",
  messagingSenderId: "1012255613844",
  appId: "1:1012255613844:web:5908382ce7de7fc3f6e581"
};

initializeApp(firebaseConfig);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
function getRestaurantIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurantId');
  }
  

  
  document.addEventListener('DOMContentLoaded', async () => {

    
    const starRatingContainer = document.getElementById('starRating');
    const starsra = starRatingContainer.querySelectorAll('.star');
    let selectedRating

    starsra.forEach((star, index) => {
        star.addEventListener('click', () => {
            // Clear previous ratings
            starsra.forEach(s => s.classList.remove('clicked'));

            // Highlight selected stars
            for (let i = 0; i <= index; i++) {
                starsra[i].classList.add('clicked');
            }

            // Send the selected rating to your JavaScript logic
            selectedRating = index + 1;
            console.log('Selected Rating:', selectedRating);

            // You can use `selectedRating` as needed, for example, send it to your server.
        });
    });

    const starRating = document.getElementById('starRating');
    const stars = Array.from(starRating.getElementsByClassName('star'));

    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            // highlightStars(index);
        });

        star.addEventListener('mouseout', () => {
            resetStars();
        });

        star.addEventListener('click', () => {
            setRating(index + 1);
        });
    });

    function highlightStars(index) {
        resetStars();
        stars.slice(0, index + 1).forEach((star) => {
            star.classList.add('hover:bg-yellow-300');
        });
    }

    function resetStars() {
        stars.forEach((star) => {
            star.classList.remove('hover:bg-yellow-300');
        });
    }

    function setRating(rating) {
        resetStars();
        stars.slice(0, rating).forEach((star) => {
            star.classList.add('clicked');
        });
    }



    const userGreeting = document.getElementById('userGreeting');
    const connectBtn = document.getElementById('connectBtn');
  
    // Handle user authentication state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Fetch additional user details from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
      
            // Update user display name if available in Firestore
            if (userData && userData.name) {
              // Set the display name for the user
              await updateProfile(user, {
                displayName: userData.name,
              });
            }
      
            // User is signed in
            userGreeting.innerText = `Hello ${user.displayName || user.email}`;
            userGreeting.classList.remove('hidden');
            connectBtn.style.display = "none";
            console.log('User authenticated:', user);
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        } else {
          userGreeting.classList.add('hidden');
          console.log('User signed out');
        }
      });
    const restaurantId = getRestaurantIdFromUrl();
  
    try {
      const response = await fetch(`http://localhost:3000/resto/${restaurantId}`);
      const data = await response.json();
  
      if (data.restaurant) {
        console.log('Retrieved restaurant details:', data.restaurant);
        displayRestaurantDetails(data.restaurant);
        displayReviews(data.reviews);
      } else {
        console.error('Restaurant not found.');
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }


    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

  // Get values from the form
  const stars = parseInt(selectedRating);
  const comment = document.getElementById('comment').value;

  // Make sure stars are between 1 and 5
  if (stars < 1 || stars > 5) {
    alert('Stars must be between 1 and 5.');
    return;
  }

  try {
    // Fetch the restaurantId from the URL
    const restaurantId = getRestaurantIdFromUrl();

    // Check if the user is authenticated
    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in to add a review.');
      return;
    }

    // Get the user email
    const userEmail = user.email;

    // Fetch the user from the collection based on email
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersCollection, where('email', '==', userEmail)));

    let userId = null;

    querySnapshot.forEach((doc) => {
      userId = doc.id;
    });

    // Add the new review to the backend with the userId
    const response = await fetch('http://localhost:3000/addReview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stars, comment, userId, restaurantId }),
    });

    const data = await response.json();
    console.log(data);
  
        // Fetch and display updated reviews after adding a new one
        const updatedResponse = await fetch(`http://localhost:3000/resto/${restaurantId}`);
        const updatedData = await updatedResponse.json();
  
        // Update the HTML with restaurant details and reviews
        displayRestaurantDetails(updatedData.restaurant);
        displayReviews(updatedData.reviews);
      } catch (error) {
        console.error('Error adding review:', error);
      }
    });

   
  });
  
  function displayRestaurantDetails(restaurant) {
    const restaurantDetailsContainer = document.getElementById('restaurantDetails');
    restaurantDetailsContainer.innerHTML = `
    <div class="bg-gray-900 p-6 rounded-lg mb-8">
    <h2 class="text-6xl font-bold text-white mb-4">${restaurant.name}</h2>
    <p class="text-gray-300 mb-2"> <span class="text-blue-500 font-medium text-base"> ${restaurant.code_postal}</span>, ${restaurant.address}</p>
  </div>
  
    `;
  }
  
  async function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews');
  
    // Clear existing reviews
    reviewsContainer.innerHTML = '';
  
    for (const review of reviews) {
        const li = document.createElement('li');
        li.classList.add('py-4', 'px-6', 'bg-gray-800', 'rounded-lg', 'shadow-md', 'mb-4');
    
        const ratingStars = getRatingStars(review.rating);
    
        li.innerHTML = `
          <div class="flex items-start justify-between">
            <div class="w-2/3">
            <span class="text-blue-500 font-medium text-base">${review.user ? review.user.name : 'Unknown User'}</span> 
              <p class="text-lg font-semibold"> ${ratingStars}</p>
              <p class="text-gray-300 font-semibold text-xl">${review.comment}</p>
            </div>
          </div>
          <hr class="my-3 border-t border-gray-700">
        `;
    
        reviewsContainer.appendChild(li);
      }
    }
    
    function getRatingStars(stars) {
      const fullStars = '<i class="fas fa-star text-yellow-500"></i>'.repeat(stars);
      const emptyStars = '<i class="fas fa-star text-gray-500"></i>'.repeat(5 - stars);
      return `${fullStars}${emptyStars}`;
    }
