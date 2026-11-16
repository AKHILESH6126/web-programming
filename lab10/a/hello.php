<?php
session_start();
date_default_timezone_set("Asia/Kolkata");

// Store the name and start time in the session when the form is submitted
if (isset($_POST["name"]) && trim($_POST["name"]) !== "") {
    $_SESSION["name"] = trim($_POST["name"]);
    $_SESSION["start_time"] = time();
}

// No session yet: send the user back to the form
if (!isset($_SESSION["name"])) {
    header("Location: index.html");
    exit;
}

$name = htmlspecialchars($_SESSION["name"]);
$start = date("h:i:s A", $_SESSION["start_time"]);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="start-time">Start time: <?php echo $start; ?></div>
  <div class="card">
    <h1>Hello, <?php echo $name; ?>!</h1>
    <p>You are now logged in.</p>
    <form action="logout.php" method="post">
      <button type="submit">Logout</button>
    </form>
  </div>
</body>
</html>
