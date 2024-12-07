document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form submission
    
    // Get the email and password from the form inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Send an AJAX request to the server
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
      if (data.status === 'error') {
        // If there's an error, display the error message
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = data.message;
        errorMessage.style.display = 'block';  // Show the error message
      } else {
        // Redirect the user on successful login (for example to a dashboard)
        window.location.href = '/dashboard';  // Adjust this to your desired redirect location
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Optionally show a generic error message if something goes wrong
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
      errorMessage.style.display = 'block';
    });
  });
  