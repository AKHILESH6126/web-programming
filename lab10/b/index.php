<?php
date_default_timezone_set("Asia/Kolkata");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Date, Time and Day</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="card">
    <h1>Current Date, Time and Day</h1>
    <table>
      <tr><th>Date</th><td><?php echo date("d-m-Y"); ?></td></tr>
      <tr><th>Time</th><td><?php echo date("h:i:s A"); ?></td></tr>
      <tr><th>Day</th><td><?php echo date("l"); ?></td></tr>
    </table>
  </div>
</body>
</html>
