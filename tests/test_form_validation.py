import pytest
import re

# Client-side form validation tests for Next.js login form

def test_email_format_validation():
    """Test email format validation using regex pattern"""
    # Common email validation regex pattern (similar to what might be used in your forms)
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Valid emails
    assert re.match(email_pattern, 'user@example.com') is not None
    assert re.match(email_pattern, 'user.name@example.co.uk') is not None
    assert re.match(email_pattern, 'user+tag@example.com') is not None
    
    # Invalid emails
    assert re.match(email_pattern, '') is None
    assert re.match(email_pattern, 'user@') is None
    assert re.match(email_pattern, 'user@example') is None
    assert re.match(email_pattern, '@example.com') is None

def test_password_strength_validation():
    """Test password strength validation using regex patterns"""
    # Basic password requirements (8+ chars)
    basic_password_pattern = r'.{8,}'
    
    # Strong password (8+ chars, uppercase, lowercase, number, special char)
    strong_password_pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    
    # Test basic password requirements
    assert re.match(basic_password_pattern, 'password123') is not None
    assert re.match(basic_password_pattern, 'secureP@ssw0rd') is not None
    assert re.match(basic_password_pattern, 'short') is None
    
    # Test strong password requirements (if your app uses them)
    assert re.match(strong_password_pattern, 'secureP@ssw0rd') is not None
    assert re.match(strong_password_pattern, 'password123') is None  # Missing uppercase and special char
    assert re.match(strong_password_pattern, 'Password123') is None  # Missing special char

def simulate_login_form_validation(form_data):
    """Simulate client-side form validation for login form"""
    errors = {}
    
    # Check if email is provided and valid
    if 'email' not in form_data or not form_data['email']:
        errors['email'] = 'Email is required'
    elif not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', form_data['email']):
        errors['email'] = 'Please enter a valid email address'
    
    # Check if password is provided
    if 'password' not in form_data or not form_data['password']:
        errors['password'] = 'Password is required'
    elif len(form_data['password']) < 8:
        errors['password'] = 'Password must be at least 8 characters'
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def test_login_form_validation():
    """Test login form validation function"""
    # Valid form data
    valid_data = {
        'email': 'user@example.com',
        'password': 'password123'
    }
    result = simulate_login_form_validation(valid_data)
    assert result['is_valid'] is True
    assert len(result['errors']) == 0
    
    # Missing email
    invalid_data = {
        'password': 'password123'
    }
    result = simulate_login_form_validation(invalid_data)
    assert result['is_valid'] is False
    assert 'email' in result['errors']
    
    # Invalid email format
    invalid_data = {
        'email': 'invalid-email',
        'password': 'password123'
    }
    result = simulate_login_form_validation(invalid_data)
    assert result['is_valid'] is False
    assert 'email' in result['errors']
    
    # Missing password
    invalid_data = {
        'email': 'user@example.com'
    }
    result = simulate_login_form_validation(invalid_data)
    assert result['is_valid'] is False
    assert 'password' in result['errors']
    
    # Short password
    invalid_data = {
        'email': 'user@example.com',
        'password': 'short'
    }
    result = simulate_login_form_validation(invalid_data)
    assert result['is_valid'] is False
    assert 'password' in result['errors'] 