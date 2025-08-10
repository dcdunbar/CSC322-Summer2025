<?php
// Delete a user (Part 2)
require "../config.php";
require "../common.php";

// If id is present, try to delete
if (isset($_GET["id"])) {
    try {
        $connection = new PDO($dsn, $username, $password, $options);
        $id = $_GET["id"];
        $sql = "DELETE FROM users WHERE id = :id";
        $statement = $connection->prepare($sql);
        $statement->bindValue(":id", $id);
        $statement->execute();
        $success = "User successfully deleted";
    } catch (PDOException $error) {
        $deleteError = $error->getMessage();
    }
}

// Always list current users
try {
    $connection = new PDO($dsn, $username, $password, $options);
    $sql = "SELECT * FROM users";
    $statement = $connection->prepare($sql);
    $statement->execute();
    $result = $statement->fetchAll();
} catch (PDOException $error) {
    $result = [];
    $listError = $error->getMessage();
}
?>

<?php include "templates/header.php"; ?>
<h2>Delete users</h2>

<?php if (!empty($success)): ?><p class="success"><?php echo escape($success); ?></p><?php endif; ?>
<?php if (!empty($deleteError)): ?><p><?php echo escape($deleteError); ?></p><?php endif; ?>
<?php if (!empty($listError)): ?><p><?php echo escape($listError); ?></p><?php endif; ?>

<table>
  <thead>
    <tr>
      <th>#</th><th>First Name</th><th>Last Name</th><th>Email</th>
      <th>Age</th><th>Location</th><th>Date</th><th>Delete</th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($result as $row): ?>
    <tr>
      <td><?php echo escape($row["id"]); ?></td>
      <td><?php echo escape($row["firstname"]); ?></td>
      <td><?php echo escape($row["lastname"]); ?></td>
      <td><?php echo escape($row["email"]); ?></td>
      <td><?php echo escape($row["age"]); ?></td>
      <td><?php echo escape($row["location"]); ?></td>
      <td><?php echo escape($row["date"]); ?></td>
      <td><a class="button-link" href="delete.php?id=<?php echo escape($row['id']); ?>">Delete</a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<p><a class="button-link" href="index.php">Back to home</a></p>
<?php include "templates/footer.php"; ?>
