<?php
/**
 * Edit a single user (Part 2)
 */
require "../config.php";
require "../common.php";

/* Handle form submission to update */
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!valid_csrf()) die("Invalid CSRF token.");

    try {
        $connection = new PDO($dsn, $username, $password, $options);

        $user = [
          "id"        => $_POST["id"],
          "firstname" => $_POST["firstname"],
          "lastname"  => $_POST["lastname"],
          "email"     => $_POST["email"],
          "age"       => $_POST["age"],
          "location"  => $_POST["location"],
          "date"      => $_POST["date"]
        ];

        $sql = "UPDATE users
                SET id = :id,
                    firstname = :firstname,
                    lastname = :lastname,
                    email = :email,
                    age = :age,
                    location = :location,
                    date = :date
                WHERE id = :id";

        $statement = $connection->prepare($sql);
        $statement->execute($user);
        $updated = true;
    } catch (PDOException $error) {
        $updateError = $error->getMessage();
    }
}

/* Load the target user by id from querystring */
if (isset($_GET["id"])) {
    try {
        $connection = new PDO($dsn, $username, $password, $options);
        $id = $_GET["id"];
        $sql = "SELECT * FROM users WHERE id = :id";
        $statement = $connection->prepare($sql);
        $statement->bindValue(":id", $id);
        $statement->execute();
        $user = $statement->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            die("User not found.");
        }
    } catch (PDOException $error) {
        die($error->getMessage());
    }
} else {
    die("Something went wrong!");
}
?>

<?php include "templates/header.php"; ?>

<?php if (!empty($updated)): ?>
  <p class="success"><?php echo escape($_POST["firstname"]); ?> successfully updated.</p>
<?php endif; ?>
<?php if (!empty($updateError)): ?>
<p><?php echo escape($updateError); ?></p>

<?php endif; ?>

<h2>Edit a user</h2>

<form method="post">
  <?php foreach ($user as $key => $value): ?>
    <label for="<?php echo $key; ?>"><?php echo ucfirst($key); ?></label>
    <input type="text" name="<?php echo $key; ?>" id="<?php echo $key; ?>" value="<?php echo escape($value); ?>" <?php echo ($key === "id" ? "readonly" : ""); ?>>
  <?php endforeach; ?>
  <input name="csrf" type="hidden" value="<?php echo escape($_SESSION['csrf']); ?>">
  <input type="submit" name="submit" value="Submit">
</form>

<p><a class="button-link" href="update.php">Back to list</a></p>
<p><a class="button-link" href="index.php">Back to home</a></p>

<?php include "templates/footer.php"; ?>
