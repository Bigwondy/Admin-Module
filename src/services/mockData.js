import { db as firestore } from './firebase';
import { emailService } from './emailService';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';

const COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  ACTIVITY: 'activity_logs',
  AUTH_LISTS: 'auth_lists',
  REQUESTS: 'requests'
};

// Keep Seed Data for initial population
const SEED_DATA = {
  USERS: [
    {
      email: 'admin@bank.com',
      password: 'password123', 
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
      permissions: ['*'],
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
      requestType: 'User Creation',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    },
    {
      requestType: 'User Modification',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    },
    {
      requestType: 'Role Creation',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    },
    {
      requestType: 'Role Modification',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    },
    {
      requestType: 'Card Request',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    },
    {
      requestType: 'Branch Stock Request',
      approvalLevel: 1,
      level1Role: 'role_super_admin',
      createdAt: new Date().toISOString()
    }
  ]
};

class FirebaseDB {
    constructor() {
        // We can trigger seed checks here if needed, but better to do it explicitly or lazy load
        this.checkAndSeed();
    }

    async checkAndSeed() {
        // Simple check: if users collection is empty, seed it
        try {
            const usersRef = collection(firestore, COLLECTIONS.USERS);
            const snapshot = await getDocs(query(usersRef, limit(1)));
            if (snapshot.empty) {
                console.log("Seeding Database...");
                
                // Seed Users
                for (const u of SEED_DATA.USERS) {
                    await addDoc(usersRef, u);
                }
                
                // Seed Roles
                const rolesRef = collection(firestore, COLLECTIONS.ROLES);
                for (const r of SEED_DATA.ROLES) {
                    await addDoc(rolesRef, r);
                }
                
                // Seed Auth Lists
                const authListsRef = collection(firestore, COLLECTIONS.AUTH_LISTS);
                for (const al of SEED_DATA.AUTH_LISTS) {
                    await addDoc(authListsRef, al);
                }
                
                await this.logActivity('SYSTEM', 'System', 'Database', 'Initial Seed Completed');
                console.log("Database seeding complete!");
            }
        } catch (e) {
            console.error("Error checking seed:", e);
        }
    }

    // --- USERS ---
    async getUsers() {
        const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.USERS));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addUser(user) {
        const generatedPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
        const newUser = { 
            ...user, 
            password: user.password || generatedPassword,
            createdAt: new Date().toISOString() 
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.USERS), newUser);
        
        // Send welcome email with credentials
        const emailResult = await emailService.sendWelcomeEmail(newUser.email, newUser.password);
        
        if (emailResult.success) {
            this.logActivity('CREATE_USER', 'System', newUser.email, `Created user. Welcome email sent successfully.`);
        } else {
            this.logActivity('CREATE_USER', 'System', newUser.email, `Created user. Email failed to send: ${emailResult.error}. Password: ${newUser.password}`);
        }
        
        return { id: docRef.id, ...newUser };
    }

    async updateUser(id, updates) {
        const userRef = doc(firestore, COLLECTIONS.USERS, id);
        await updateDoc(userRef, updates);
        this.logActivity('UPDATE_USER', 'Current User', updates.email || id, 'Updated user details');
        return { id, ...updates };
    }

    async deleteUser(id) {
        await deleteDoc(doc(firestore, COLLECTIONS.USERS, id));
        this.logActivity('DELETE_USER', 'Current User', id, 'Deleted user');
        return true;
    }

    async findUserByEmail(email) {
        const q = query(collection(firestore, COLLECTIONS.USERS), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // --- ROLES ---
    async getRoles() {
        const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.ROLES));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addRole(role) {
        const newRole = { ...role, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.ROLES), newRole);
        this.logActivity('CREATE_ROLE', 'Current User', role.name, 'Created new role');
        return { id: docRef.id, ...newRole };
    }

    async deleteRole(id) {
        await deleteDoc(doc(firestore, COLLECTIONS.ROLES, id));
        return true;
    }

    // --- AUTH LISTS ---
    async getAuthLists() {
        const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.AUTH_LISTS));
        // If empty, return seed data (in production you'd fetch real data)
        // For now, let's return [] or fetch from mock if we haven't seeded these yet.
        // To save time, I will assume we fetch. 
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addAuthList(authList) {
        const newList = { ...authList, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.AUTH_LISTS), newList);
        this.logActivity('CREATE_AUTH_LIST', 'Current User', authList.requestType, 'Created workflow');
        return { id: docRef.id, ...newList };
    }

    async updateAuthList(id, updates) {
        const ref = doc(firestore, COLLECTIONS.AUTH_LISTS, id);
        await updateDoc(ref, updates);
        return { id, ...updates };
    }

    async deleteAuthList(id) {
        await deleteDoc(doc(firestore, COLLECTIONS.AUTH_LISTS, id));
        return true;
    }

    // --- REQUESTS ---
    async getRequests() {
        const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.REQUESTS));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Subscribe to requests for real-time sidebar badge
    subscribeToPendingCount(roleId, callback) {
        // Fetch all pending requests first (simplified, ideally we filter server side)
        // Since we store 'level1Role' in AuthLists, joining is hard in NoSQL.
        // We will query ALL pending requests and filter client side for correct Count, 
        // OR better: store `approverRoles` array on the request document itself.
        // For now, let's listen to ALL pending requests
        const q = query(collection(firestore, COLLECTIONS.REQUESTS), where("status", "==", "Pending"));
        
        return onSnapshot(q, async (snapshot) => {
            const requests = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
            const authLists = await this.getAuthLists();
            
            const relevant = requests.filter(req => {
                const list = authLists.find(l => l.id === req.authListId);
                // Hardcoded fallback if list missing
                if (!list) return true; 
                // Check if current level matches role
                const roleForLevel = list[`level${req.currentLevel}Role`];
                return roleForLevel === roleId;
            });
            
            callback(relevant.length);
        });
    }

    async addRequest(type, payload, initiatorEmail) {
        // We need an AuthList ID.
        // In real app, we fetch list by type.
        const authLists = await this.getAuthLists();
        const authList = authLists.find(l => l.requestType === type);
        
        const newReq = {
            type: type,
            customerName: payload.name || payload.email || 'System Action',
            branch: payload.branch || 'System',
            payload: payload,
            date: new Date().toISOString(),
            status: 'Pending',
            currentLevel: 1,
            authListId: authList ? authList.id : 'unknown',
            history: [{
                level: 0,
                action: 'Submitted',
                actor: initiatorEmail,
                date: new Date().toISOString()
            }]
        };
        
        const docRef = await addDoc(collection(firestore, COLLECTIONS.REQUESTS), newReq);
        this.logActivity('SUBMIT_REQUEST', initiatorEmail, type, 'Submitted new approval request');
        return { id: docRef.id, ...newReq };
    }

    async getPendingRequestsForRole(roleId) {
        // Fetch snapshot
        const q = query(collection(firestore, COLLECTIONS.REQUESTS), where("status", "==", "Pending"));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        const authLists = await this.getAuthLists();

        return requests.filter(req => {
            const list = authLists.find(l => l.id === req.authListId);
            if (!list) return false;
            const roleForLevel = list[`level${req.currentLevel}Role`];
            return roleForLevel === roleId;
        });
    }

    async approveRequest(id, actorEmail) {
        try {
            const reqRef = doc(firestore, COLLECTIONS.REQUESTS, id);
            const reqSnap = await getDoc(reqRef);
            if (!reqSnap.exists()) return false;
            
            const req = { id: reqSnap.id, ...reqSnap.data() };
            const authLists = await this.getAuthLists();
            const list = authLists.find(l => l.id === req.authListId || l.requestType === req.type);

            if (!list) {
                console.error("Auth list not found for request type:", req.type);
                return false;
            }

            // Update History
            const newHistory = [...(req.history || []), {
                level: req.currentLevel,
                action: 'Approved',
                actor: actorEmail,
                date: new Date().toISOString()
            }];

            if (req.currentLevel < list.approvalLevel) {
                // Move to next level
                await updateDoc(reqRef, {
                    currentLevel: req.currentLevel + 1,
                    history: newHistory
                });
                this.logActivity('APPROVE_REQUEST', actorEmail, req.type, `Approved Level ${req.currentLevel}, moved to Level ${req.currentLevel + 1}`);
            } else {
                // Final Approval - EXECUTE PAYLOAD
                await updateDoc(reqRef, {
                    status: 'Approved',
                    history: newHistory
                });
                
                this.logActivity('COMPLETE_REQUEST', actorEmail, req.type, 'Final approval granted. Executing action.');
                
                // Execute based on type
                if (req.type === 'User Creation' && req.payload) {
                    await this.addUser(req.payload);
                } else if (req.type === 'User Modification' && req.payload) {
                    await this.updateUser(req.payload.id, req.payload.data);
                } else if (req.type === 'Role Creation' && req.payload) {
                    await this.addRole(req.payload);
                } else if (req.type === 'Role Modification' && req.payload) {
                    await this.updateRole(req.payload.id, req.payload.data);
                } else if (req.type === 'Branch Stock Request') {
                    this.logActivity('STOCK_APPROVED', actorEmail, req.type, `Stock request for ${req.branch} approved.`);
                }
            }
            return true;
        } catch (e) {
            console.error("Error approving request:", e);
            return false;
        }
    }

    async declineRequest(id, actorEmail) {
        const reqRef = doc(firestore, COLLECTIONS.REQUESTS, id);
        await updateDoc(reqRef, {
            status: 'Declined',
             history: [{ level: 99, action: 'Declined', actor: actorEmail, date: new Date().toISOString() }]
        });
        this.logActivity('DECLINE_REQUEST', actorEmail, 'Request', 'Request Declined');
        return true;
    }

    // --- ACTIVITY LOGS ---
    async logActivity(action, actor, target, details) {
        await addDoc(collection(firestore, COLLECTIONS.ACTIVITY), {
            action, actor, target, details,
            timestamp: new Date().toISOString()
        });
    }

    subscribeToActivity(callback) {
        const q = query(
            collection(firestore, COLLECTIONS.ACTIVITY), 
            orderBy("timestamp", "desc"), 
            limit(100)
        );
        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(logs);
        });
    }
}

export const db = new FirebaseDB();


