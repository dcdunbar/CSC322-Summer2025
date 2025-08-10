 PHP + MySQL CRUD (PDO) — Tutorial Project

This repo is a working implementation of Tania Rascia’s two‑part tutorial:

- Part 1: *Build a PHP & MySQL CRUD Database App From Scratch* (Create + Read)
- Part 2: *Create a Simple CRUD Database App (Update + Delete)*

I included minimal styling and CSRF protection per Part 2.

## Quick start

**1) Create DB + table**

Edit `config.php` if needed (DB name/user/pass). Then run the installer from the project root:

```bash
php -S localhost:8000
# in another terminal
open http://localhost:8000/install.php
```

Or run `install.php` via CLI:

```bash
php install.php
```

**2) Start the app**

If you’re not using MAMP/XAMPP, you can use PHP’s built‑in server from the project root:

```bash
php -S localhost:8000 -t public
# then visit http://localhost:8000
```

MAMP/XAMPP users: point the document root to the `public/` folder.

## Structure

```
config.php
common.php              # escape() + session + CSRF token
data/init.sql           # creates DB `test` and `users` table
install.php             # runs the SQL above

public/
  index.php
  create.php            # C
  read.php              # R
  update.php            # U (list with Edit links)
  update-single.php     # U (edit a single user)
  delete.php            # D
  templates/
    header.php
    footer.php
  css/style.css
```

## Notes

- Credentials default to MAMP defaults (`root`/`root`) with DB `test`. Change in `config.php` to match your setup.
- This is for learning, not production. Sanity checks are minimal, and deletion is via GET to mirror the tutorial.
