// Database Functions for Bill Calculator

// Save bill calculation
async function saveBillCalculation(userId, billData) {
  try {
    const { data, error } = await supabaseClient
      .from('bills')
      .insert([{
        user_id: userId,
        bill_amount: billData.amount,
        payment_date: billData.date,
        status: billData.status || 'pending',
        notes: billData.notes || ''
      }]);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving bill:', error);
    return { success: false, error };
  }
}

// Get user's bill history
async function getUserBills(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching bills:', error);
    return { success: false, error };
  }
}

// Update bill status
async function updateBillStatus(billId, status) {
  try {
    const { data, error } = await supabaseClient
      .from('bills')
      .update({ status })
      .eq('id', billId);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating bill:', error);
    return { success: false, error };
  }
}

// Delete bill
async function deleteBill(billId) {
  try {
    const { error } = await supabaseClient
      .from('bills')
      .delete()
      .eq('id', billId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting bill:', error);
    return { success: false, error };
  }
}

// Sign up user
async function signUp(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error };
  }
}

// Sign in user
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error };
  }
}

// Sign out user
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error };
  }
}
