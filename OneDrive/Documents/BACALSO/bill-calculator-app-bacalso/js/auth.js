// Authentication Helper Functions for Supabase

/**
 * Initialize authentication and check if user is logged in
 * Returns session if authenticated, null otherwise
 */
async function initAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }
        return session;
    } catch (error) {
        console.error('Error initializing auth:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * Returns session if authenticated, null otherwise
 */
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Error checking auth:', error);
            return null;
        }
        return session;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
}

/**
 * Get current authenticated user
 * Returns user object if authenticated, null otherwise
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @returns {object} - Contains data, error, and user info
 */
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: data,
            message: 'Registration successful! Please check your email to verify your account.',
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} - Contains success status and session/error
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            session: data.session,
            user: data.user,
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 * @returns {boolean} - True if successful, false otherwise
 */
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error('Error signing out:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

/**
 * Update user profile
 * @param {object} updates - Object containing profile fields to update
 * @returns {object} - Contains success status and data/error
 */
async function updateUserProfile(updates) {
    try {
        const { data, error } = await supabaseClient.auth.updateUser({
            data: updates,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: data,
            message: 'Profile updated successfully!',
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Redirect to login if not authenticated
 * Use this on protected pages
 */
async function redirectIfNotAuthenticated() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'login.html';
    }
    return session;
}

/**
 * Redirect to dashboard if already authenticated
 * Use this on login/register pages
 */
async function redirectIfAuthenticated() {
    const session = await checkAuth();
    if (session) {
        window.location.href = 'user_dashboard.html';
    }
    return session;
}
