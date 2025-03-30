import pytest
import requests
import json
import uuid
import time

# Utility functions for authentication
def get_csrf_token(session):
    """Get CSRF token for authentication"""
    response = session.get("http://localhost:3000/api/auth/csrf")
    assert response.status_code == 200
    
    data = response.json()
    assert "csrfToken" in data
    return data["csrfToken"]

def authenticate_user(session, email, password):
    """Authenticate with NextAuth and return the session"""
    csrf_token = get_csrf_token(session)
    
    login_data = {
        "csrfToken": csrf_token,
        "email": email,
        "password": password,
        "callbackUrl": "http://localhost:3000"
    }
    
    response = session.post(
        "http://localhost:3000/api/auth/callback/credentials",
        data=login_data
    )
    
    assert response.status_code in [200, 302]
    return session

# Tests for user operations
def test_add_and_delete_user():
    """Test creating a new user and then deleting it"""
    # Setup: Create a session and authenticate as admin
    session = requests.Session()
    authenticate_user(session, "admin@example.com", "password123")
    
    # Step 1: Create a new user with a unique identifier
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"test.user.{unique_id}@example.com"
    user_data = {
        "name": f"Test User {unique_id}",
        "email": test_email,
        "password": "password123",
        "role": "USER"
    }
    
    # Send request to create user
    create_response = session.post(
        "http://localhost:3000/api/admin/users",
        json=user_data
    )
    
    # Verify response
    assert create_response.status_code == 201
    created_user = create_response.json()
    assert "user" in created_user
    user_id = created_user["user"]["id"]
    
    # Verify the user was created with the correct data
    assert created_user["user"]["name"] == f"Test User {unique_id}"
    assert created_user["user"]["email"] == test_email
    assert created_user["user"]["role"] == "USER"
    assert "password" not in created_user["user"]  # Password should not be returned
    
    # Step 2: Verify the user exists by fetching all users
    get_response = session.get("http://localhost:3000/api/admin/users")
    assert get_response.status_code == 200
    users = get_response.json()
    
    # Find our created user in the list
    created_user_in_list = next((user for user in users if user["id"] == user_id), None)
    assert created_user_in_list is not None
    assert created_user_in_list["email"] == test_email
    
    # Step 3: Delete the user
    delete_response = session.delete(f"http://localhost:3000/api/admin/users/{user_id}")
    assert delete_response.status_code == 200
    
    # Step 4: Verify the user has been deleted
    get_response = session.get("http://localhost:3000/api/admin/users")
    assert get_response.status_code == 200
    users = get_response.json()
    
    # Ensure the user is no longer in the list
    deleted_user = next((user for user in users if user["id"] == user_id), None)
    assert deleted_user is None

def test_create_user_validation():
    """Test validation when creating a user"""
    # Setup: Create a session and authenticate
    session = requests.Session()
    authenticate_user(session, "admin@example.com", "password123")
    
    # Test 1: Create user with missing required fields
    invalid_user = {
        "name": "Invalid User",
        # Missing email
        "password": "password123",
        "role": "USER"
    }
    
    response = session.post(
        "http://localhost:3000/api/admin/users",
        json=invalid_user
    )
    
    # Should fail validation
    assert response.status_code == 400
    
    # Test 2: Create user with invalid role
    invalid_user = {
        "name": "Invalid User",
        "email": "invalid@example.com",
        "password": "password123",
        "role": "INVALID_ROLE"  # Only USER and ADMIN are valid
    }
    
    response = session.post(
        "http://localhost:3000/api/admin/users",
        json=invalid_user
    )
    
    # Should fail validation
    assert response.status_code == 400
    
    # Test 3: Create user with short password
    invalid_user = {
        "name": "Invalid User",
        "email": "invalid@example.com",
        "password": "short",  # Too short
        "role": "USER"
    }
    
    response = session.post(
        "http://localhost:3000/api/admin/users",
        json=invalid_user
    )
    
    # Should fail validation
    assert response.status_code == 400

def test_user_permissions():
    """Test that regular users cannot access admin functions"""
    # Create a session and authenticate as a regular user
    session = requests.Session()
    authenticate_user(session, "user1@example.com", "password123")
    
    # Try to access admin-only endpoints
    
    # Try to list all users
    response = session.get("http://localhost:3000/api/admin/users")
    assert response.status_code == 401
    
    # Try to create a new user
    user_data = {
        "name": "Unauthorized User",
        "email": "unauth@example.com",
        "password": "password123",
        "role": "USER"
    }
    
    response = session.post(
        "http://localhost:3000/api/admin/users",
        json=user_data
    )
    
    assert response.status_code == 401 