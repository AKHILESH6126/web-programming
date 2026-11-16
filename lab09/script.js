document.getElementById("load").addEventListener("click", loadXML);

function loadXML() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 && xhr.responseXML) {
        displayTable(xhr.responseXML);
      } else {
        var status = document.getElementById("status");
        status.textContent = "Could not load employees.xml (open the page through a local server).";
        status.className = "error";
      }
    }
  };
  xhr.open("GET", "employees.xml", true);
  xhr.send();
}

function displayTable(xml) {
  var employees = xml.getElementsByTagName("employee");
  var fields = ["id", "name", "department", "designation", "email", "salary"];
  var tbody = document.querySelector("#emp-table tbody");
  tbody.innerHTML = "";

  for (var i = 0; i < employees.length; i++) {
    var row = document.createElement("tr");
    for (var j = 0; j < fields.length; j++) {
      var cell = document.createElement("td");
      cell.textContent = employees[i].getElementsByTagName(fields[j])[0].textContent;
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }

  var status = document.getElementById("status");
  status.textContent = employees.length + " employee records loaded.";
  status.className = "";
}
