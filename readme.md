<h1>BACKEND MASTERY WITH HITESH CHOUDHARY</h1>

# Clonetube – Backend of a YouTube-like Application

This project is focused on understanding and building the backend of YouTube-like applications.  
It is developed with **industry-standard best practices** as guided by Hitesh Choudhary, with additional improvements and modifications based on my own understanding.

---

## **Technologies Used**
- **MongoDB Atlas** – Database
- **Cloudinary** – File storage (images, videos, etc.)
- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **Multer** – File uploading middleware
- **JWT (JSON Web Tokens)** – Authentication
- **cookie-parser** – Cookie handling
- **Postman** – API testing

---

## **Project Structure**
The main source code is located in the `src` directory:

1. **controllers/** – Contains controllers for each route.
2. **db/** – Handles database connections.
3. **middlewares/** – Includes custom middlewares (e.g., authentication, multer configuration).
4. **models/** – Defines database schemas and data models.
5. **routes/** – Declares all API routes.
6. **utils/** – Utility functions (e.g., API error/response handlers, Cloudinary utilities).

Other important files:
- `app.js` – Main application setup.
- `constants.js` – Application constants.
- `index.js` – Server entry point.

---

## **Implemented Features**
1. **User Registration** – Supports avatar and cover image uploads along with other text details.
2. **Login** – Authenticate with either email or username plus password.
3. **Logout**
4. **Profile Updates** – Change email, avatar image, and cover image.
5. **Channel Profile Details** – Fetch subscriber count and subscriptions using Mongoose aggregation pipelines.
6. **Token Refresh** – Issue new access tokens when expired by validating refresh tokens stored in both the database and cookies.
7. **Password Change**
8. **Subscribe to a Channel**
9. **Watch History Tracking**

---

## **In-Progress Features**
- Video upload controller.
- Like and comment functionality.
- Playlist management.
- Additional features to follow.

---
