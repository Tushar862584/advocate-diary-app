/**
 * API service for managing cases
 */

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

type ReassignCasesParams = {
  sourceUserId?: string | null;
  targetUserId: string;
};

type ReassignCasesResponse = {
  count: number;
  message: string;
};

/**
 * Transfer cases from one user to another
 */
export async function reassignCases({ 
  sourceUserId, 
  targetUserId 
}: { 
  sourceUserId: string; 
  targetUserId: string 
}): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch('/api/admin/cases/reassign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceUserId,
        targetUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Failed to reassign cases' };
    }

    return { data: { message: data.message || 'Cases reassigned successfully' } };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

type AssignCaseParams = {
  caseId: string;
  userId: string;
};

type AssignCaseResponse = {
  message: string;
  case: any; // Replace with your case type
};

/**
 * Assign a specific case to a user
 */
export async function assignCase(params: AssignCaseParams): Promise<ApiResponse<AssignCaseResponse>> {
  try {
    const response = await fetch("/api/admin/cases/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to assign the case" };
    }

    return { data };
  } catch (error) {
    console.error("API error:", error);
    return { error: "An error occurred while assigning the case" };
  }
}

/**
 * Get all cases
 * @param includePERSONAL - Whether to include PERSONAL cases (only relevant for admins)
 */
export async function getCases(includePERSONAL = false): Promise<ApiResponse<any[]>> {
  try {
    const url = includePERSONAL ? '/api/cases?includePERSONAL=true' : '/api/cases';
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Failed to fetch cases' };
    }

    return { data: data };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get all users with case counts
 */
export async function getUsersWithCaseCounts(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch('/api/admin/users/with-case-counts');
    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Failed to fetch users' };
    }

    return { data: data.users };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
} 