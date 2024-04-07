const express = require('express');
const { db } = require('./firebase');
const cors = require('cors');
const path = require('path');
const app = express();
const functions = require('firebase-functions')
const port = process.env.PORT || 3000;

// Allow all origins during development
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
// Endpoint to fetch all names from the "resto" collection
app.get('/resto', async (req, res) => {
  try {
    const querySnapshot = await db.collection('Resto').get();

    const restaurants = [];
    querySnapshot.forEach((doc) => {
      const restaurantData = {
        id: doc.id,  // Include the restaurant ID
        name: doc.data().name,
        address: doc.data().address,
        code_postal: doc.data().code_postal,
      };
      restaurants.push(restaurantData);
    });

    res.json({ restaurants });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to add a new restaurant to the "Resto" collection
app.post('/resto', async (req, res) => {
  try {
    const { name, address, code_postal } = req.body;
    const code_postalNumber = parseInt(code_postal, 10);

    // Validation (you can add more validation if needed)

    const newRestaurantRef = await db.collection('Resto').add({
      name,
      address,
      code_postal: code_postalNumber,
    });

    res.json({ id: newRestaurantRef.id, message: 'Restaurant added successfully' });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/createUser', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const newUserRef = await db.collection('users').add({
      name,
      email,
      role,
    });

    res.json({ id: newUserRef.id, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/reviews', async (req, res) => {
  try {
    // Fetch reviews from the Reviews collection
    const reviewsSnapshot = await db.collection('Reviews').get();
    const reviews = [];

    // Iterate through each review
    for (const reviewDoc of reviewsSnapshot.docs) {
      const reviewData = reviewDoc.data();
      const { userId, restaurantId } = reviewData;

      // Fetch user information from the Users collection
      const userSnapshot = await db.collection('users').doc(userId).get();
      const userData = userSnapshot.data();

      // Fetch restaurant information from the Resto collection
      const restaurantSnapshot = await db.collection('Resto').doc(restaurantId).get();
      const restaurantData = restaurantSnapshot.data();

      // Combine the information
      const combinedReview = {
        userName: userData.email,
        restaurantName: restaurantData.name,
        restaurantAddress: restaurantData.address,
        stars: reviewData.stars,
        comment: reviewData.comment,
      };

      reviews.push(combinedReview);
    }

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/resto/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id;

    // Fetch restaurant details
    const restaurantDoc = await db.collection('Resto').doc(restaurantId).get();
    const restaurantData = {
      id: restaurantDoc.id,
      name: restaurantDoc.data().name,
      address: restaurantDoc.data().address,
      code_postal: restaurantDoc.data().code_postal,
    };

    // Fetch reviews with user details
    const reviewsSnapshot = await db.collection('Reviews').where('restaurantId', '==', restaurantId).get();
    const reviews = [];

    for (const doc of reviewsSnapshot.docs) {
      const reviewData = {
        rating: doc.data().stars,
        comment: doc.data().comment,
        user: await getUserDetails(doc.data().userId),
      };
      reviews.push(reviewData);
    }

    res.json({ restaurant: restaurantData, reviews });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function getUserDetails(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists) {
      return {
        id: userDoc.id,
        name: userDoc.data().name,
        email: userDoc.data().email,
        // Add other user details as needed
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// Endpoint pour ajouter une note et un commentaire
app.post('/addReview', async (req, res) => {
  try {
    const { stars, comment,userId, restaurantId } = req.body;
    

    // Ajoutez la revue à la collection "Reviews"
    const newReviewRef = await db.collection('Reviews').add({
      stars,
      comment,
      userId,
      restaurantId,
    });

    res.json({ id: newReviewRef.id, message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


exports.foodcritic = functions.https.onRequest(app)