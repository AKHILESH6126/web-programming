(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var num1 = document.getElementById("num1");
  var num2 = document.getElementById("num2");
  var operation = document.getElementById("operation");
  var result = document.getElementById("result");
  var history = document.getElementById("history");

  var symbols = { add: "+", subtract: "\u2212", multiply: "\u00D7", divide: "\u00F7" };

  function showError(message) {
    result.textContent = message;
    result.className = "error";
  }

  function calculate(a, b, op) {
    switch (op) {
      case "add": return a + b;
      case "subtract": return a - b;
      case "multiply": return a * b;
      case "divide": return a / b;
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (num1.value.trim() === "" || num2.value.trim() === "") {
      showError("Please fill in both numbers.");
      return;
    }

    var a = parseFloat(num1.value);
    var b = parseFloat(num2.value);

    if (isNaN(a) || isNaN(b)) {
      showError("Both values must be valid numbers.");
      return;
    }
    if (operation.value === "divide" && b === 0) {
      showError("You can't divide by zero. Change the second number.");
      return;
    }

    var answer = parseFloat(calculate(a, b, operation.value).toFixed(10));
    var line = a + " " + symbols[operation.value] + " " + b + " = " + answer;

    result.textContent = line;
    result.className = "";

    var empty = history.querySelector(".empty");
    if (empty) { history.removeChild(empty); }
    var item = document.createElement("li");
    item.textContent = line;
    history.insertBefore(item, history.firstChild);
    while (history.children.length > 8) { history.removeChild(history.lastChild); }
  });

  form.addEventListener("reset", function () {
    result.textContent = "Enter two numbers to begin.";
    result.className = "";
  });
})();
