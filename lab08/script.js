document.getElementById("user-form").addEventListener("submit", function (event) {
  event.preventDefault();

  var user = {
    "Name": document.getElementById("name").value.trim(),
    "Gender": document.querySelector("input[name='gender']:checked").value,
    "Mobile Number": document.getElementById("mobile").value.trim(),
    "Mail ID": document.getElementById("email").value.trim(),
    "City": document.getElementById("city").value.trim(),
    "State": document.getElementById("state").value.trim(),
    "Country": document.getElementById("country").value
  };

  sessionStorage.setItem("user", JSON.stringify(user));
  window.location.href = "details.html";
});
