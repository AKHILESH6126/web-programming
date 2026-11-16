<?php
$name = htmlspecialchars(trim($_POST["name"] ?? ""));
$age = (int) ($_POST["age"] ?? 0);

if ($name === "" || $age <= 0) {
    header("Location: index.html");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Result</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="card">
    <?php if ($age < 18) { ?>
      <h1 class="error">Hello <?php echo $name; ?>, you are not authorized to visit the site</h1>
    <?php } else { ?>
      <h1 class="success">Welcome to this site</h1>
    <?php } ?>
    <a href="index.html">&larr; Go back</a>
  </div>
</body>
</html>
