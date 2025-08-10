<?php
/* List all users with Edit link (Part 2) */
require "../config.php";
require "../common.php";

try {
    $connection = new PDO($dsn, $username, $password, $options);
    $sql = "SELECT * FROM users";
    $statement = $connection->prepare($sql);
    $statement->execute();
    $result = $statement->fetchAll();
} catch (PDOException $error) {
    $result = [];
    $err = $error->getMessage();
}
?>

<?php include "templates/header.php"; ?>
<h2>Update users</h2>

<table>
  <thead>
    <tr>
      <th>#</th><th>First Name</th><th>Last Name</th><th>Email</th>
      <th>Age</th><th>Location</th><th>Date</th><th>Edit</th>
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
      <td><a class="button-link" href="update-single.php?id=<?php echo escape($row['id']); ?>">Edit</a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<p><a class="button-link" href="index.php">Back to home</a></p>
<?php include "templates/footer.php"; ?>
