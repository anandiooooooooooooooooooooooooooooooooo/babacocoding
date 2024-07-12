// register.js

function togglePasswordVisibility() {
    var passwordField = document.getElementById("password");
    var eyeIcon = document.getElementById("eye-icon");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.src = "./action-hide-password.png"; // Change image source to indicate hide password
    } else {
        passwordField.type = "password";
        eyeIcon.src = "./pass-show.png"; // Change image source to indicate show password
    }
}