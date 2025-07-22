import React, { useState, useEffect } from 'react';

const EditUserForm = ({ currentUser, setEditing, updateUser }) => {
  const [user, setUser] = useState(currentUser);

  // Sync form when parent state (currentUser) changes
  useEffect(() => setUser(currentUser), [currentUser]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        updateUser(user.id, user);
      }}
    >
      <label>Name</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={handleInputChange}
      />

      <label>Username</label>
      <input
        type="text"
        name="username"
        value={user.username}
        onChange={handleInputChange}
      />

      <button>Update user</button>
      <button
        onClick={() => setEditing(false)}
        className="button muted-button"
        type="button"
      >
        Cancel
      </button>
    </form>
  );
};

export default EditUserForm;
