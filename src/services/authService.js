import { db } from './mockData';

export const authService = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = db.findUserByEmail(email);

    if (!user || user.password !== password) {
      throw new Error('Incorrect login details');
    }

    // Determine return object (omit password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Log activity
    db.logActivity('LOGIN', email, 'System', 'User logged in successfully');

    return userWithoutPassword;
  },

  logout: async (userEmail) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (userEmail) {
      db.logActivity('LOGOUT', userEmail, 'System', 'User logged out');
    }
  }
};
