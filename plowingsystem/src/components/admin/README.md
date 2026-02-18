# Admin / Crew management (#12)

Implemented: create crew members (Name, Email, Role), generate temporary password, list crew, revoke access.

## API

- **GET /api/crew** – List crew. Response: `[{ id, name, email, role, active }]`
- **POST /api/crew** – Create crew member. Body: `{ name, email, role: "Driver" | "Admin" }`. Backend generates temporary password. Response: `{ id, message, tempPassword }`
- **PATCH /api/crew/:id/deactivate** – Revoke access (set `active: false`). Response: `{ message, id }`

Admin shares the temporary password manually with the crew member. They can use it to log in (login flow to be implemented in a later sprint).
