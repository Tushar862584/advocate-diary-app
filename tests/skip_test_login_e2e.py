import re
import pytest
from playwright.sync_api import Playwright, expect

@pytest.fixture(scope="function")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "viewport": {
            "width": 1920,
            "height": 1080,
        },
    }

def test_admin_login(page):
    # Navigate to login page
    page.goto("https://advocate-diary.vercel.app/login")
    
    # Login process
    page.get_by_role("textbox", name="you@example.com").fill("admin@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    
    # Assertions
    expect(page.locator("div").filter(has_text=re.compile(r"^Admin Dashboard$")).get_by_role("heading")).to_be_visible()
    expect(page.locator("body")).to_contain_text("Admin Dashboard")
    expect(page.get_by_label("Sidebar navigation")).to_contain_text("Admin User")

def test_user1_login(page):
    # Navigate to login page
    page.goto("https://advocate-diary.vercel.app/login")
    
    # Login process
    page.get_by_role("textbox", name="you@example.com").fill("user1@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    
    # Assertions
    expect(page.get_by_label("Sidebar navigation")).to_contain_text("User 1")

def test_user2_login(page):
    # Navigate to login page
    page.goto("https://advocate-diary.vercel.app/login")
    
    # Login process
    page.get_by_role("textbox", name="you@example.com").fill("user2@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    
    # Assertions
    expect(page.get_by_label("Sidebar navigation")).to_contain_text("User 2")