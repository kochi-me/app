import { supabase, TABLES } from './supabase.js';

class DatabaseManager {
  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Test connection
      const { data, error } = await supabase.from(TABLES.COURSES).select('count', { count: 'exact' });
      if (error) {
        console.error('Database connection error:', error);
        throw error;
      }
      console.log('✅ Connected to Supabase database');
    } catch (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      throw new Error('Supabase connection failed. Please check your configuration in .env file.');
    }
  }

  // Course operations
  async getAllCourses() {
    try {
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  async getCourseById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return null;
    }
  }

  async addCourse(course) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .insert([course])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding course:', error);
      return { data: null, error };
    }
  }

  async updateCourse(id, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COURSES)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating course:', error);
      return { data: null, error };
    }
  }

  async deleteCourse(id) {
    try {
      const { error } = await supabase
        .from(TABLES.COURSES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { error };
    }
  }

  // Chat operations
  async getAllMessages() {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async addMessage(message, sender, courseId = null) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .insert([{ message, sender, course_id: courseId }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding message:', error);
      return { data: null, error };
    }
  }

  async clearMessages() {
    try {
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .delete()
        .neq('id', 0); // Delete all messages

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error clearing messages:', error);
      return { error };
    }
  }

  // Real-time subscriptions
  subscribeToCourses(callback) {
    return supabase
      .channel('courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.COURSES }, callback)
      .subscribe();
  }

  subscribeToMessages(callback) {
    return supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.MESSAGES }, callback)
      .subscribe();
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: true,
      isLocalMode: false,
      provider: 'supabase'
    };
  }

  async testConnection() {
    try {
      const { data, error } = await supabase.from(TABLES.COURSES).select('count', { count: 'exact' });
      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default new DatabaseManager();
