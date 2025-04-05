import pytest
import requests
import json
import uuid
import time

# Utility functions for authentication
def get_csrf_token(session):
    """Get CSRF token for authentication"""
    response = session.get("https://advocate-diary.vercel.app/api/auth/csrf")
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
        "callbackUrl": "https://advocate-diary.vercel.app"
    }
    
    response = session.post(
        "https://advocate-diary.vercel.app/api/auth/callback/credentials",
        data=login_data
    )
    
    assert response.status_code in [200, 302]
    return session

# Tests for case operations
def test_add_and_delete_case():
    """Test creating a new case and then deleting it"""
    # Setup: Create a session and authenticate as admin
    session = requests.Session()
    authenticate_user(session, "admin@example.com", "password123")
    
    # Step 1: Create a new case with a unique identifier
    unique_id = str(uuid.uuid4())[:8]
    case_data = {
        "caseType": "CIVIL",
        "registrationNum": 12345,
        "registrationYear": 2023,
        "title": f"Test Case {unique_id}",
        "courtName": "Test Court",
        "petitioners": [
            {
                "name": f"Petitioner {unique_id}",
                "advocate": "Advocate P"
            }
        ],
        "respondents": [
            {
                "name": f"Respondent {unique_id}",
                "advocate": "Advocate R"
            }
        ]
    }
    
    # Send request to create case
    create_response = session.post(
        "https://advocate-diary.vercel.app/api/cases",
        json=case_data
    )
    
    # Verify response
    assert create_response.status_code == 201
    created_case = create_response.json()
    assert "id" in created_case
    case_id = created_case["id"]
    
    # Verify the case was created with the correct data
    assert created_case["title"] == f"Test Case {unique_id}"
    assert created_case["caseType"] == "CIVIL"
    assert created_case["registrationNum"] == 12345
    assert created_case["registrationYear"] == 2023
    assert len(created_case["petitioners"]) == 1
    assert len(created_case["respondents"]) == 1
    assert created_case["petitioners"][0]["name"] == f"Petitioner {unique_id}"
    assert created_case["respondents"][0]["name"] == f"Respondent {unique_id}"
    
    # Step 2: Verify the case exists by fetching it
    get_response = session.get(f"https://advocate-diary.vercel.app/api/cases/{case_id}")
    assert get_response.status_code == 200
    fetched_case = get_response.json()
    assert fetched_case["id"] == case_id
    
    # Step 3: Delete the case
    delete_response = session.delete(f"https://advocate-diary.vercel.app/api/cases/{case_id}")
    assert delete_response.status_code == 200
    
    # Step 4: Verify the case has been deleted
    verify_response = session.get(f"https://advocate-diary.vercel.app/api/cases/{case_id}")
    assert verify_response.status_code == 404
    
def test_create_case_validation():
    """Test validation when creating a case"""
    # Setup: Create a session and authenticate
    session = requests.Session()
    authenticate_user(session, "admin@example.com", "password123")
    
    # Test case with missing required fields
    invalid_case = {
        "caseType": "CIVIL",
        # Missing registrationNum and registrationYear
        "courtName": "Test Court",
        # Missing petitioners and respondents
    }
    
    response = session.post(
        "https://advocate-diary.vercel.app/api/cases",
        json=invalid_case
    )
    
    # Should fail validation
    assert response.status_code == 400
    
    # Test case with empty arrays for petitioners and respondents
    invalid_case = {
        "caseType": "CIVIL",
        "registrationNum": 12345,
        "registrationYear": 2023,
        "courtName": "Test Court",
        "petitioners": [],
        "respondents": []
    }
    
    response = session.post(
        "https://advocate-diary.vercel.app/api/cases",
        json=invalid_case
    )
    
    # Should fail validation
    assert response.status_code == 400 