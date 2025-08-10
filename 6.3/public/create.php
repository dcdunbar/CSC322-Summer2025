<?php
require "../config.php";
require "../common.php";

$created = false;
$errorMsg = null;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!valid_csrf()) die("Invalid CSRF token.");

    try {
        $connection = new PDO($dsn, $username, $password, $options);

        $new_user = [
            "firstname" => $_POST["firstname"] ?? "",
            "lastname"  => $_POST["lastname"] ?? "",
            "email"     => $_POST["email"] ?? "",
            "age"       => $_POST["age"] ?? null,
            "location"  => $_POST["location"] ?? "",
        ];

        $sql = sprintf(
            "INSERT INTO users (%s) values (:%s)",
            implode(", ", array_keys($new_user)),
            implode(", :", array_keys($new_user))
        );

        $statement = $connection->prepare($sql);
        $statement->execute($new_user);
        $created = true;
    } catch (PDOException $error) {
        $errorMsg = $error->getMessage();
    }
}
?>

<?php include "templates/header.php"; ?>

<?php if ($created): ?>
  <p class="success"><?php echo escape($_POST["firstname"]); ?> added.</p>
<?php endif; ?>
<?php if ($errorMsg): ?>
  <p><?php echo escape($errorMsg); ?></p>
<?php endif; ?>

<h2>Add a user</h2>
<form method="post">
  <div class="row">
    <label for="firstname">First Name</label>
    <input type="text" name="firstname" id="firstname" required>
  </div>
  <div class="row">
    <label for="lastname">Last Name</label>
    <input type="text" name="lastname" id="lastname" required>
  </div>
  <div class="row">
    <label for="email">Email Address</label>
    <input type="email" name="email" id="email" required>
  </div>
  <div class="row">
    <label for="age">Age</label>
    <input type="number" name="age" id="age" min="0" max="150">
  </div>
  <div class="row">
    <label for="location">Location</label>
    <input type="text" name="location" id="location" required>
  </div>

  <input name="csrf" type="hidden" value="<?php echo escape($_SESSION['csrf']); ?>">
  <input type="submit" name="submit" value="Submit">
</form>

<p><a class="button-link" href="index.php">Back to home</a></p>
<?php include "templates/footer.php"; ?>
