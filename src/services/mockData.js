/**
 * Mock Service to simulate database operations using localStorage.
 * This ensures data persists across reloads.
 */

const DB_KEYS = {
  USERS: 'admin_module_users',
  ROLES: 'admin_module_roles',
  ACTIVITY: 'admin_module_activity',
};

const SEED_DATA = {
  USERS: [
    {
      id: 'usr_1',
      email: 'admin@bank.com',
      password: 'password123', // In a real app, this would be hashed
      roleId: 'role_super_admin',
      accessLevel: 'Bank-wide',
      createdAt: new Date().toISOString(),
    }
  ],
  ROLES: [
    {
      id: 'role_super_admin',
      name: 'Super Admin',
      module: 'All',
      permissions: ['*'], // '*' implies all permissions
      createdAt: new Date().toISOString(),
    },
    {
       id: 'role_branch_manager',
       name: 'Branch Manager',
       module: 'Lyra CMS',
       permissions: ['View'],
       createdAt: new Date().toISOString()
    }
  ],
  AUTH_LISTS: [
      {
          id: 'auth_card_req',
          requestType: 'Card Request',
          approvalLevel: 2,
          level1Role: 'role_branch_manager',
          level2Role: 'role_super_admin',
          createdAt: new Date().toISOString()
      },
    {
        id: 'auth_user_creation',
        requestType: 'User Creation',
        approvalLevel: 2,
        level1Role: 'role_super_admin', // Changed for easier testing
        level2Role: 'role_super_admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 'auth_user_modification',
        requestType: 'User Modification',
        approvalLevel: 2,
        level1Role: 'role_branch_manager',
        level2Role: 'role_super_admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 'auth_role_creation',
        requestType: 'Role Creation',
        approvalLevel: 2, // Critical action
        level1Role: 'role_super_admin',
        level2Role: 'role_super_admin', // simplified for mock
        createdAt: new Date().toISOString()
    },
    {
        id: 'auth_role_modification',
        requestType: 'Role Modification',
        approvalLevel: 2,
        level1Role: 'role_super_admin',
        level2Role: 'role_super_admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 'auth_branch_stock',
        requestType: 'Branch Stock Request',
        approvalLevel: 1,
        level1Role: 'role_branch_manager', // Manager approves stock
        createdAt: new Date().toISOString()
    }
  ],
  REQUESTS: [
      {
          id: 'req_101',
          type: 'Card Request',
          customerName: 'John Doe',
          branch: 'Main Branch',
          date: new Date().toISOString(),
          status: 'Pending',
          currentLevel: 2, // Waiting for Level 2 (Super Admin)
          authListId: 'auth_card_req',
          history: [
              { level: 1, action: 'Approved', actor: 'Branch Manager User', date: new Date(Date.now() - 86400000).toISOString() }
          ]
      },
      {
        id: 'req_102',
        type: 'Card Request',
        customerName: 'Jane Smith',
        branch: 'Downtown Branch',
        date: new Date().toISOString(),
        status: 'Pending',
        currentLevel: 1, // Waiting for Level 1 (Branch Manager)
        authListId: 'auth_card_req',
        history: []
      {
        id: 'req_102',
        type: 'Card Request',
        customerName: 'Jane Smith',
        branch: 'Downtown Branch',
        date: new Date().toISOString(),
        status: 'Pending',
        currentLevel: 1, // Waiting for Level 1 (Branch Manager)
        authListId: 'auth_card_req',
        history: []
    }
  ],
  ACTIVITY: [
      { id: 'log_seed_1', action: 'LOGIN', actor: 'admin@bank.com', target: 'System', details: 'Successful login', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'log_seed_2', action: 'APPROVE_REQUEST', actor: 'branch_manager@bank.com', target: 'Card Request', details: 'Approved Level 1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'log_seed_3', action: 'SUBMIT_REQUEST', actor: 'teller@bank.com', target: 'Card Request', details: 'Submitted new approval request', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { id: 'log_seed_4', action: 'CREATE_USER', actor: 'admin@bank.com', target: 'new_staff@bank.com', details: 'Created user. Email sent.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 'log_seed_5', action: 'LOGIN', actor: 'branch_manager@bank.com', target: 'System', details: 'Successful login', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
      { id: 'log_seed_6', action: 'UPDATE_ROLE', actor: 'super_admin@bank.com', target: 'Branch Manager', details: 'Updated role permissions', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: 'log_seed_7', action: 'LOGOUT', actor: 'teller@bank.com', target: 'System', details: 'User logged out', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() }
  ]
};

class MockDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_DATA.USERS));
    }
    if (!localStorage.getItem(DB_KEYS.ROLES)) {
      localStorage.setItem(DB_KEYS.ROLES, JSON.stringify(SEED_DATA.ROLES));
    }
    if (!localStorage.getItem(DB_KEYS.ACTIVITY)) {
      localStorage.setItem(DB_KEYS.ACTIVITY, JSON.stringify(SEED_DATA.ACTIVITY));
    }
    // Force update Auth Lists to ensure new permissions apply
    localStorage.setItem('admin_module_auth_lists', JSON.stringify(SEED_DATA.AUTH_LISTS));
    if (!localStorage.getItem('admin_module_requests')) {
        localStorage.setItem('admin_module_requests', JSON.stringify(SEED_DATA.REQUESTS));
     }
  }


  getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  }

  addUser(user) {
    const users = this.getUsers();
    // Simulate auto-increment or random ID
    const generatedPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
    const newUser = { 
        ...user, 
        id: `usr_${Date.now()}`, 
        password: user.password || generatedPassword, // Use provided or generate new
        createdAt: new Date().toISOString() 
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.logActivity('CREATE_USER', 'System', newUser.email, `Created user. Email sent with password: ${newUser.password}`);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      this.logActivity('UPDATE_USER', 'Current User', users[index].email, 'Updated user details');
      return users[index];
    }
    return null;
  }

  deleteUser(id) {
    let users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      users = users.filter(u => u.id !== id);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      this.logActivity('DELETE_USER', 'Current User', user.email, 'Deleted user');
      return true;
    }
    return false;
  }

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  }

  getRoles() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ROLES) || '[]');
  }

  addRole(role) {
    const roles = this.getRoles();
    const newRole = { 
        ...role, 
        id: `role_${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    roles.push(newRole);
    localStorage.setItem(DB_KEYS.ROLES, JSON.stringify(roles));
    this.logActivity('CREATE_ROLE', 'Current User', role.name, 'Created new role');
    return newRole;
  }

  updateRole(id, updates) {
    const roles = this.getRoles();
    const index = roles.findIndex(r => r.id === id);
    if (index !== -1) {
      roles[index] = { ...roles[index], ...updates };
      localStorage.setItem(DB_KEYS.ROLES, JSON.stringify(roles));
      this.logActivity('UPDATE_ROLE', 'Current User', roles[index].name, 'Updated role permissions');
      return roles[index];
    }
    return null;
  }

  deleteRole(id) {
    let roles = this.getRoles();
    const role = roles.find(r => r.id === id);
    if (role) {
      roles = roles.filter(r => r.id !== id);
      localStorage.setItem(DB_KEYS.ROLES, JSON.stringify(roles));
      this.logActivity('DELETE_ROLE', 'Current User', role.name, 'Deleted role');
      // Also should probably update/invalidate users with this role, but ignoring for mock
      return true;
    }
    return false;
  }


  getAuthLists() {
    return JSON.parse(localStorage.getItem('admin_module_auth_lists') || '[]');
  }

  addAuthList(authList) {
    const lists = this.getAuthLists();
    const newList = { 
        ...authList, 
        id: `auth_list_${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    lists.push(newList);
    localStorage.setItem('admin_module_auth_lists', JSON.stringify(lists));
    this.logActivity('CREATE_AUTH_LIST', 'Current User', authList.requestType, 'Created authorization workflow');
    return newList;
  }

  updateAuthList(id, updates) {
    const lists = this.getAuthLists();
    const index = lists.findIndex(l => l.id === id);
    if (index !== -1) {
      lists[index] = { ...lists[index], ...updates };
      localStorage.setItem('admin_module_auth_lists', JSON.stringify(lists));
      this.logActivity('UPDATE_AUTH_LIST', 'Current User', lists[index].requestType, 'Updated authorization workflow');
      return lists[index];
    }
    return null;
  }

  deleteAuthList(id) {
    let lists = this.getAuthLists();
    const list = lists.find(l => l.id === id);
    if (list) {
      lists = lists.filter(l => l.id !== id);
      localStorage.setItem('admin_module_auth_lists', JSON.stringify(lists));
      this.logActivity('DELETE_AUTH_LIST', 'Current User', list.requestType, 'Deleted authorization workflow');
      return true;
    }
    return false;
  }

  deleteAuthList(id) {
    let lists = this.getAuthLists();
    const list = lists.find(l => l.id === id);
    if (list) {
      lists = lists.filter(l => l.id !== id);
      localStorage.setItem('admin_module_auth_lists', JSON.stringify(lists));
      this.logActivity('DELETE_AUTH_LIST', 'Current User', list.requestType, 'Deleted authorization workflow');
      return true;
    }
    return false;
  }

  getRequests() {
      return JSON.parse(localStorage.getItem('admin_module_requests') || '[]');
  }

  addRequest(type, payload, initiatorEmail) {
    const lists = this.getAuthLists();
    // Default to the first list if specific type not found (fallback)
    const authList = lists.find(l => l.requestType === type) || lists[0];
    
    if (!authList) {
        console.error("No Auth List found for type:", type);
        return null;
    }

    const requests = this.getRequests();
    const newReq = {
        id: `req_${Date.now()}`,
        type: type,
        customerName: payload.name || payload.email || 'System Action',
        branch: payload.branch || 'System',
        payload: payload, // Store the data to be executed later
        date: new Date().toISOString(),
        status: 'Pending',
        currentLevel: 1,
        authListId: authList.id,
        history: [{
            level: 0,
            action: 'Submitted',
            actor: initiatorEmail,
            date: new Date().toISOString()
        }]
    };
    
    requests.push(newReq);
    localStorage.setItem('admin_module_requests', JSON.stringify(requests));
    this.logActivity('SUBMIT_REQUEST', initiatorEmail, type, 'Submitted new approval request');
    return newReq;
  }

  getPendingRequestsForRole(roleId) {
      const requests = this.getRequests();
      const authLists = this.getAuthLists();
      
      return requests.filter(req => {
          if (req.status !== 'Pending') return false;
          
          const list = authLists.find(l => l.id === req.authListId);
          if (!list) return false;

          // Check if current level matches the role
          const roleForLevel = list[`level${req.currentLevel}Role`];
          return roleForLevel === roleId;
      });
  }

  approveRequest(id, actorEmail) {
      const requests = this.getRequests();
      const index = requests.findIndex(r => r.id === id);
      if (index === -1) return false;
      
      const req = requests[index];
      const authLists = this.getAuthLists();
      const list = authLists.find(l => l.id === req.authListId);
      
      // Update History
      req.history.push({
          level: req.currentLevel,
          action: 'Approved',
          actor: actorEmail,
          date: new Date().toISOString()
      });

      if (req.currentLevel < list.approvalLevel) {
          // Move to next level
          req.currentLevel += 1;
          this.logActivity('APPROVE_REQUEST', actorEmail, req.type, `Approved Level ${req.currentLevel - 1}, moved to Level ${req.currentLevel}`);
      } else {
          // Final Approval - EXECUTE PAYLOAD
          req.status = 'Approved';
          this.logActivity('COMPLETE_REQUEST', actorEmail, req.type, 'Final approval granted. Executing action.');
          
          // Execute based on type
          if (req.type === 'User Creation' && req.payload) {
              this.addUser(req.payload);
          } else if (req.type === 'User Modification' && req.payload) {
              this.updateUser(req.payload.id, req.payload.data);
          } else if (req.type === 'Role Creation' && req.payload) {
              this.addRole(req.payload);
          } else if (req.type === 'Role Modification' && req.payload) {
              this.updateRole(req.payload.id, req.payload.data);
          } else if (req.type === 'Branch Stock Request') {
              // Just log it or update a stock DB if we had one
              this.logActivity('STOCK_APPROVED', actorEmail, req.type, `Stock request for ${req.branch} approved.`);
          }
      }

      localStorage.setItem('admin_module_requests', JSON.stringify(requests));
      return true;
  }

  declineRequest(id, actorEmail) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return false;

    const req = requests[index];
    req.status = 'Declined';
    req.history.push({
        level: req.currentLevel,
        action: 'Declined',
        actor: actorEmail,
        date: new Date().toISOString()
    });

    this.logActivity('DECLINE_REQUEST', actorEmail, req.type, 'Request declined');
    localStorage.setItem('admin_module_requests', JSON.stringify(requests));
    return true;
  }

  logActivity(action, actor, target, details) {
    const logs = JSON.parse(localStorage.getItem(DB_KEYS.ACTIVITY) || '[]');
    const newLog = {
      id: `log_${Date.now()}`,
      action,
      actor,
      target,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Add to beginning
    // Keep log size manageable
    if (logs.length > 200) logs.pop();
    localStorage.setItem(DB_KEYS.ACTIVITY, JSON.stringify(logs));
  }
}

export const db = new MockDB();
