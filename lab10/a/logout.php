<?php
session_start();

if (!isset($_SESSION["name"])) {
    header("Location: index.html");
    exit;
}

$name = htmlspecialchars($_SESSION["name"]);
$seconds = time() - $_SESSION["start_time"];

$hours = floor($seconds / 3600);
$minutes = floor(($seconds % 3600) / 60);
$secs = $seconds % 60;
$duration = sprintf("%02d:%02d:%02d", $hours, $minutes, $secs);

// End the session
session_unset();
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Logged Out</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="card">
    <h1>Thank You, <?php echo $name; ?>!</h1>
    <p>You have been logged out.</p>
    <p>Duration of usage: <strong><?php echo $duration; ?></strong> (hh:mm:ss)</p>
    <a href="index.html">Login again</a>
  </div>
</body>
</html>
