from fastapi import FastAPI, HTTPException, Depends
import mysql.connector
from pydantic import BaseModel
import bcrypt

app = FastAPI()

# Database Configuration
db_config = {
    "host": "localhost",
    "user": "your_username",
    "password": "your_password",
    "database": "user_database"
}

# User model for validation
class User(BaseModel):
    name: str
    email: str
    password: str

# Function to get database connection
def get_db():
    conn = mysql.connector.connect(**db_config)
    return conn

# Register a new user
@app.post("/register")
def register(user: User):
    conn = get_db()
    cursor = conn.cursor()

    # Hash password
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    try:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                       (user.name, user.email, hashed_password))
        conn.commit()
        return {"message": "User registered successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# User login
@app.post("/login")
def login(user: User):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT password FROM users WHERE email = %s", (user.email,))
    result = cursor.fetchone()

    if result and bcrypt.checkpw(user.password.encode('utf-8'), result[0].encode('utf-8')):
        return {"message": "Login successful!"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    cursor.close()
    conn.close()

# Run the app using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
