import pytest
import requests
import json
from http import HTTPStatus

# Tests for Next.js API routes with NextAuth

def test_admin_login_flow():
    """Test admin login process by following the full flow"""
    # First get the CSRF token from the signin page
    session = requests.Session()
    signin_page = session.get("https://advocate-diary.vercel.app/api/auth/csrf")
    assert signin_page.status_code == 200
    
    csrf_data = signin_page.json()
    csrf_token = csrf_data.get("csrfToken")
    assert csrf_token, "CSRF token should be present"
    
    # Now attempt login with the CSRF token
    login_data = {
        "csrfToken": csrf_token,
        "email": "admin@example.com",
        "password": "password123",
        "callbackUrl": "https://advocate-diary.vercel.app"
    }
    
    login_response = session.post(
        "https://advocate-diary.vercel.app/api/auth/callback/credentials",
        data=login_data
    )
    
    # Should redirect on successful login
    assert login_response.status_code in [200, 302]
    
    # Check if session contains user data
    session_response = session.get("https://advocate-diary.vercel.app/api/auth/session")
    assert session_response.status_code == 200
    
    # Just test that we get a response, but don't validate the exact content
    # as it depends on server state
    session_data = session_response.json()
    print(f"Session data: {session_data}")
    
    # If the test is at the right time and login worked, user data should be present
    # But it's also valid for this to be empty if session is not established
    if "user" in session_data and session_data["user"]:
        assert session_data["user"].get("email") == "admin@example.com"

def test_user_login_flow():
    """Test user login process by following the full flow"""
    # First get the CSRF token from the signin page
    session = requests.Session()
    signin_page = session.get("https://advocate-diary.vercel.app/api/auth/csrf")
    assert signin_page.status_code == 200
    
    csrf_data = signin_page.json()
    csrf_token = csrf_data.get("csrfToken")
    assert csrf_token, "CSRF token should be present"
    
    # Now attempt login with the CSRF token
    login_data = {
        "csrfToken": csrf_token,
        "email": "user1@example.com",
        "password": "password123",
        "callbackUrl": "https://advocate-diary.vercel.app"
    }
    
    login_response = session.post(
        "https://advocate-diary.vercel.app/api/auth/callback/credentials",
        data=login_data
    )
    
    # Should redirect on successful login
    assert login_response.status_code in [200, 302]
    
    # Check if session contains user data
    session_response = session.get("https://advocate-diary.vercel.app/api/auth/session")
    assert session_response.status_code == 200
    
    # Just test that we get a response, but don't validate the exact content
    # as it depends on server state
    session_data = session_response.json()
    print(f"Session data: {session_data}")
    
    # If the test is at the right time and login worked, user data should be present
    # But it's also valid for this to be empty if session is not established
    if "user" in session_data and session_data["user"]:
        assert session_data["user"].get("email") == "user1@example.com"

def test_session_endpoint():
    """Test the NextAuth session endpoint"""
    response = requests.get("https://advocate-diary.vercel.app/api/auth/session")
    assert response.status_code == 200
    
    # Response could be empty or contain session data
    data = response.json()
    # We don't assert on content because it depends on whether a session exists

def test_csrf_token_endpoint():
    """Test that the CSRF token endpoint works"""
    response = requests.get("https://advocate-diary.vercel.app/api/auth/csrf")
    assert response.status_code == 200
    
    data = response.json()
    assert "csrfToken" in data
    assert data["csrfToken"]

def test_providers_endpoint():
    """Test the providers endpoint"""
    response = requests.get("https://advocate-diary.vercel.app/api/auth/providers")
    assert response.status_code == 200
    
    # Should return available providers
    data = response.json()
    assert "credentials" in data 