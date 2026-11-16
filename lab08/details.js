var data = sessionStorage.getItem("user");
var table = document.getElementById("details");

if (data) {
  var user = JSON.parse(data);
  for (var field in user) {
    var row = table.insertRow();
    var th = document.createElement("th");
    th.textContent = field;
    row.appendChild(th);
    row.insertCell().textContent = user[field];
  }
} else {
  document.getElementById("message").textContent = "No details found. Please fill in the form first.";
}
