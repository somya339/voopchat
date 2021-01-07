const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');
const btn = document.querySelector(".signup");
// btn.disabled = true;
const success = [];
setInterval(() => {
  let x = Math.floor(Math.random() * 11 + 1)
  document.querySelector("body").style.backgroundImage = `url(../images/${x}.jpg)`
}, 10000)

// Show input error message
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = 'form-control error';
  const small = formControl.querySelector('small');
  small.innerText = message;
}

// Show success outline
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = 'form-control success';
}

// Check email is valid
function checkEmail(input) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(input.value.trim())) {
    success[0] = 1;
    check_valid();
    showSuccess(input);
  } else {
    success[0] = 0;
    showError(input, 'Email is not valid');
  }
}

// Check required fields
function checkRequired(inputArr) {
  inputArr.forEach(function (input) {
    if (input.value.trim() === '') {
      success[1] = 0;
      showError(input, `${getFieldName(input)} is required`);
    } else {
      success[1] = 1;
      check_valid();
      showSuccess(input);
    }
  });
}

// Check input length
function checkLength(input, min, max) {
  if (input.value.length < min) {
    success[2] = 0;
    showError(
      input,
      `${getFieldName(input)} must be at least ${min} characters`
    );
    e.preventDefault();
  } else if (input.value.length > max) {
    success[2] = 0;
    showError(
      input,
      `${getFieldName(input)} must be less than ${max} characters`
    );

  } else {
    showSuccess(input);
  }
}

// Check passwords match
function checkPasswordsMatch(input1, input2) {
  if (input1.value !== input2.value) {
    success[2] = 1;
    check_valid();
    showError(input2, 'Passwords do not match');
  }
}
// Enable button 
function check_valid() {
  success.forEach(e => {
    if (e != 1) {
      return
    }
  })
  btn.disabled = false;
}
// Get fieldname
function getFieldName(input) {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// Event listeners
form.addEventListener("focusout", function (e) {
  // e.preventDefault();
  console.log("click");
  checkRequired([username, email, password, password2]);
  checkLength(username, 3, 15);
  checkLength(password, 6, 25);
  checkEmail(email);
  checkPasswordsMatch(password, password2);
});