import React, { useState } from 'react';

const AddUserForm = ({ addUser }) => {
  const initialFormState = { id: null, name: '', username: '' };
  const [user, setUser] = useState(initialFormState);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!user.name || !user.username) return;
        addUser(user);
        setUser(initialFormState);
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

      <button>Add new user</button>
    </form>
  );
};

export default AddUserForm;
