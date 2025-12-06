/**
 * System History Manager
 * Tracks all user actions and stores them in Supabase, localStorage, and allows export
 */

class HistoryManager {
    constructor() {
        this.historyTable = 'system_history';
        this.localStorageKey = 'app_history_local';
        this.maxLocalRecords = 100; // Keep last 100 records in localStorage
    }

    /**
     * Record an action to history
     * @param {string} action - Type of action (login, logout, calculate, save, delete, etc)
     * @param {string} description - Detailed description of the action
     * @param {object} metadata - Additional data about the action
     */
    async recordAction(action, description, metadata = {}) {
        try {
            const user = await getCurrentUser();
            if (!user) return;

            const timestamp = new Date().toISOString();
            const historyRecord = {
                user_id: user.id,
                action: action,
                description: description,
                metadata: metadata,
                timestamp: timestamp,
                user_agent: navigator.userAgent,
                page_url: window.location.href
            };

            // Save to localStorage first (for offline support)
            this.saveToLocalStorage(historyRecord);

            // Save to Supabase
            await this.saveToSupabase(historyRecord);

            console.log('Action recorded:', action);
        } catch (error) {
            console.error('Error recording action:', error);
        }
    }

    /**
     * Save record to localStorage
     */
    saveToLocalStorage(record) {
        try {
            let history = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            history.push(record);

            // Keep only last N records
            if (history.length > this.maxLocalRecords) {
                history = history.slice(-this.maxLocalRecords);
            }

            localStorage.setItem(this.localStorageKey, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Save record to Supabase
     */
    async saveToSupabase(record) {
        try {
            const { data, error } = await supabaseClient
                .from('system_history')
                .insert([record]);

            if (error) {
                console.error('Error saving to Supabase:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            return false;
        }
    }

    /**
     * Get history from Supabase
     * @param {number} limit - Number of records to fetch
     */
    async getHistoryFromSupabase(limit = 100) {
        try {
            const user = await getCurrentUser();
            if (!user) return [];

            const { data, error } = await supabaseClient
                .from('system_history')
                .select('*')
                .eq('user_id', user.id)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching history:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }

    /**
     * Get history from localStorage
     */
    getHistoryFromLocalStorage() {
        try {
            return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return [];
        }
    }

    /**
     * Export history to CSV
     */
    async exportToCSV(days = 30) {
        try {
            const history = await this.getHistoryFromSupabase(1000);

            // Filter by date if specified
            let filtered = history;
            if (days) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                filtered = history.filter(record => 
                    new Date(record.timestamp) >= cutoffDate
                );
            }

            // Create CSV
            const headers = ['Timestamp', 'Action', 'Description', 'Page URL', 'User Agent'];
            const rows = filtered.map(record => [
                new Date(record.timestamp).toLocaleString(),
                record.action,
                record.description,
                record.page_url,
                record.user_agent
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => 
                    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
                        .join(',')
                )
            ].join('\n');

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system_history_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('History exported to CSV');
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('Error exporting history: ' + error.message);
        }
    }

    /**
     * Clear history from Supabase (user's own records only)
     */
    async clearSupabaseHistory() {
        try {
            const user = await getCurrentUser();
            if (!user) return false;

            const { error } = await supabaseClient
                .from('system_history')
                .delete()
                .eq('user_id', user.id);

            if (error) {
                console.error('Error clearing history:', error);
                return false;
            }

            console.log('Supabase history cleared');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    /**
     * Clear localStorage history
     */
    clearLocalHistory() {
        try {
            localStorage.removeItem(this.localStorageKey);
            console.log('Local history cleared');
            return true;
        } catch (error) {
            console.error('Error clearing local history:', error);
            return false;
        }
    }

    /**
     * Get statistics about user actions
     */
    async getStatistics() {
        try {
            const history = await this.getHistoryFromSupabase(1000);

            const stats = {
                total_actions: history.length,
                actions_by_type: {},
                actions_by_date: {},
                most_recent_action: history[0] || null,
                oldest_action: history[history.length - 1] || null
            };

            // Count by action type
            history.forEach(record => {
                stats.actions_by_type[record.action] = 
                    (stats.actions_by_type[record.action] || 0) + 1;

                // Count by date
                const date = new Date(record.timestamp).toLocaleDateString();
                stats.actions_by_date[date] = 
                    (stats.actions_by_date[date] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return null;
        }
    }

    /**
     * Get history with filters
     */
    async getFilteredHistory(filters = {}) {
        try {
            let query = supabaseClient
                .from('system_history')
                .select('*');

            if (filters.action) {
                query = query.eq('action', filters.action);
            }

            if (filters.startDate) {
                query = query.gte('timestamp', filters.startDate);
            }

            if (filters.endDate) {
                query = query.lte('timestamp', filters.endDate);
            }

            const { data, error } = await query
                .order('timestamp', { ascending: false })
                .limit(filters.limit || 100);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching filtered history:', error);
            return [];
        }
    }
}

// Initialize global history manager
const historyManager = new HistoryManager();

/**
 * Convenience functions for logging specific actions
 */

async function logLogin(email) {
    await historyManager.recordAction('login', `User logged in: ${email}`, { email });
}

async function logLogout(email) {
    await historyManager.recordAction('logout', `User logged out: ${email}`, { email });
}

async function logCalculation(data) {
    await historyManager.recordAction(
        'calculate',
        `Calculation: ${data.power_consumption} kWh @ ₱${data.cost_per_kwh}/kWh = ₱${data.result}`,
        data
    );
}

async function logSaveCalculation(calculationId, data) {
    await historyManager.recordAction(
        'save_calculation',
        `Saved calculation #${calculationId}`,
        { calculation_id: calculationId, ...data }
    );
}

async function logDeleteCalculation(calculationId) {
    await historyManager.recordAction(
        'delete_calculation',
        `Deleted calculation #${calculationId}`,
        { calculation_id: calculationId }
    );
}

async function logProfileUpdate(updates) {
    await historyManager.recordAction(
        'update_profile',
        `Updated profile information`,
        updates
    );
}

async function logPageView(pageName) {
    await historyManager.recordAction(
        'page_view',
        `Viewed page: ${pageName}`,
        { page_name: pageName }
    );
}

async function logError(errorType, errorMessage) {
    await historyManager.recordAction(
        'error',
        `${errorType}: ${errorMessage}`,
        { error_type: errorType, error_message: errorMessage }
    );
}
