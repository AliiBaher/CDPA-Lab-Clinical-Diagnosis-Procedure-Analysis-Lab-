# Creating Admin Account with Thunder Client

## Steps to Create Admin Account Once and For All:

### 1. Start the API
```bash
cd api
dotnet run
```
The API will be running at `http://localhost:5172`

### 2. Open Thunder Client
- Install Thunder Client extension in VS Code
- Click on the Thunder Client icon

### 3. Create New Request
- Click "New Request"
- Set method to **POST**
- Set URL to: `http://localhost:5172/auth/register`

### 4. Set Request Body (JSON)
Click on "Body" tab and paste:

```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "Admin@123456",
  "phone": "+1234567890",
  "role": "admin",
  "specialty": null
}
```

### 5. Send Request
- Click "Send"
- You'll receive a response with JWT token

### 6. Verify Admin Was Created
In your database, you can verify:
```sql
SELECT id, email, first_name, last_name, role FROM app_users WHERE email = 'admin@example.com';
```

### 7. Login with Admin Account
Now you can login with:
- Email: `admin@example.com`
- Password: `Admin@123456`

## Important Notes:
✅ The password will be automatically hashed with PBKDF2 before saving to database
✅ You only need to do this once - the admin account persists in the database
✅ You can create additional admins the same way
✅ Change the credentials in production for security!

## Alternative: Use api.http File
There's already an `api.http` file in the project. You can add this request there too for easy reuse.
