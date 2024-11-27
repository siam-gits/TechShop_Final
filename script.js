// For login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target.name.value; // Get the username
  const password = e.target.password.value; // Get the password

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const result = await response.json();
    if (response.status === 200) {
      // If login is successful, redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      alert(result.message); // Show error message if invalid credentials
    }
  } catch (error) {
    alert("Error logging in!");
  }
});

// For signup form submission
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission
  const name = e.target.username.value; // Get the username
  const password = e.target.password.value; // Get the password

  try {
    // Send the data to the backend
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }), // Send data as JSON
    });

    const result = await response.json(); // Parse the response as JSON

    // Handle responses
    if (response.status === 400) {
      // If the username is already taken, show the error message
      alert(result.message); // Display the error message
    } else if (response.status === 201) {
      // If signup is successful, show the success message
      alert(result.message); // Display the success message
      // Redirect to the signup success page
      window.location.href = result.redirect; // Redirect to signup success page
    }
  } catch (error) {
    alert("Error signing up!"); // Handle any other errors
  }
});

// Slider Functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".slider .slide");
const totalSlides = slides.length;
const slideInterval = 3000; // 3 seconds

function showSlide(index) {
  if (index >= totalSlides) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = totalSlides - 1;
  } else {
    currentSlide = index;
  }

  const offset = -currentSlide * 100;
  document.querySelector(".slider").style.transform = `translateX(${offset}%)`;
}

function moveSlide(step) {
  showSlide(currentSlide + step);
}

// Initialize slider
function startSlider() {
  setInterval(() => {
    moveSlide(1);
  }, slideInterval);
}

document.querySelector(".prev").addEventListener("click", () => moveSlide(-1));
document.querySelector(".next").addEventListener("click", () => moveSlide(1));

// Show the first slide on page load and start the slider
showSlide(currentSlide);
startSlider();
