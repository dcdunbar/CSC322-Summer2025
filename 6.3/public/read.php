<?php
require "../config.php";
require "../common.php";

$results = [];
$errorMsg = null;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!valid_csrf()) die("Invalid CSRF token.");

    try {
        $connection = new PDO($dsn, $username, $password, $options);

        $location = $_POST["location"] ?? "";
        $sql = "SELECT * FROM users WHERE location = :location";

        $statement = $connection->prepare($sql);
        $statement->bindValue(":location", $location);
        $statement->execute();

        $results = $statement->fetchAll();
    } catch (PDOException $error) {
        $errorMsg = $error->getMessage();
    }
}
?>

<?php include "templates/header.php"; ?>

<h2>Find user by location</h2>
<form method="post">
  <label for="location">Location</label>
  <input type="text" id="location" name="location">
  <input name="csrf" type="hidden" value="<?php echo escape($_SESSION['csrf']); ?>">
  <input type="submit" name="submit" value="View Results">
</form>

<?php if ($errorMsg): ?>
  <p><?php echo escape($errorMsg); ?></p>
<?php endif; ?>

<?php if ($results): ?>
  <h2>Results</h2>
  <table>
    <thead>
      <tr>
        <th>#</th><th>First Name</th><th>Last Name</th><th>Email</th>
        <th>Age</th><th>Location</th><th>Date</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($results as $row): ?>
      <tr>
        <td><?php echo escape($row["id"]); ?></td>
        <td><?php echo escape($row["firstname"]); ?></td>
        <td><?php echo escape($row["lastname"]); ?></td>
        <td><?php echo escape($row["email"]); ?></td>
        <td><?php echo escape($row["age"]); ?></td>
        <td><?php echo escape($row["location"]); ?></td>
        <td><?php echo escape($row["date"]); ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

<p><a class="button-link" href="index.php">Back to home</a></p>
<?php include "templates/footer.php"; ?>
