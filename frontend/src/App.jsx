import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  UserCheck, 
  FileText, 
  Search, 
  Plus, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  User,
  Clock,
  Camera,
  BookMarked,
  Sparkles,
  LogIn
} from 'lucide-react';
import WebcamCapture from './components/WebcamCapture';
import bookContents from './data/bookContent';
import { DEFAULT_BOOKS, DEFAULT_USERS, DEFAULT_ATTENDANCE } from './data/defaultDbData';

const API_BASE = 'http://127.0.0.1:5000/api';

const euclideanDistance = (desc1, desc2) => {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return 999.0;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(Number(desc1[i]) - Number(desc2[i]), 2);
  }
  return Math.sqrt(sum);
};

function App() {
  // Navigation: 'home' (curated catalog), 'attendance' (scanner portal), 'dashboard' (profile + auth)
  const [currentView, setCurrentView] = useState('home');
  
  // Fallback state if Flask API is unreachable
  const [isUsingMockDb, setIsUsingMockDb] = useState(false);
  
  // Library Portal Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'student' | 'admin'
  const [authTab, setAuthTab] = useState('student'); // 'student' | 'admin'
  const [adminPassword, setAdminPassword] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState('overview'); // 'overview' | 'suggestions' | 'students' | 'issues' | 'logs' | 'add-book'
  const [allOrders, setAllOrders] = useState([]);
  const [isProcessingFaceLogin, setIsProcessingFaceLogin] = useState(false);

  // Add Book Admin states
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('Programming & Tech');

  // App States
  const [books, setBooks] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, activeStudents: 0, logsToday: 0 });
  
  // Dashboard states
  const [loggedInUser, setLoggedInUser] = useState(null); // { studentId, name } or admin
  const [userProfile, setUserProfile] = useState(null); // profile data from API
  const [activeReadingBook, setActiveReadingBook] = useState(null); // book being read in modal
  
  // Text Login input states
  const [loginIdInput, setLoginIdInput] = useState('');
  const [loginSearchResults, setLoginSearchResults] = useState([]);

  // Search Fallback Attendance
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);
  const [isVerifyingSearchFace, setIsVerifyingSearchFace] = useState(false);
  const [isProcessingSearchAttendance, setIsProcessingSearchAttendance] = useState(false);

  // Register Form States (Unified inside Dashboard portal)
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regFaceDescriptor, setRegFaceDescriptor] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Modals States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderAuthor, setOrderAuthor] = useState('');
  const [orderReason, setOrderReason] = useState('');
  // Book Issue Modal (Text checkout form)
  const [issuingBook, setIssuingBook] = useState(null); // book object
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueIdInput, setIssueIdInput] = useState('');
  const [issueSearchResults, setIssueSearchResults] = useState([]);
  const [isProcessingIssue, setIsProcessingIssue] = useState(false);

  // Selected student in Admin Directory details modal
  const [selectedAdminStudent, setSelectedAdminStudent] = useState(null);
  const [adminStudentProfile, setAdminStudentProfile] = useState(null);
  const [isLoadingAdminProfile, setIsLoadingAdminProfile] = useState(false);

  // Student Auth Portal Login / Register Toggles and Password states
  const [studentSubTab, setStudentSubTab] = useState('login'); // 'login' | 'register'
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Global Toasts State
  const [toasts, setToasts] = useState([]);

  // Homepage Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchBooks();
    fetchLogs();
    fetchUsers();
    fetchOrders();
  }, []);

  // Update stats whenever books/logs/users change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const logsToday = attendanceLogs.filter(log => log.date === today).length;
    
    setStats({
      totalBooks: books.length,
      activeStudents: registeredUsers.length,
      logsToday: logsToday
    });
  }, [books, attendanceLogs, registeredUsers]);

  // Fetch user profile when loggedInUser changes
  useEffect(() => {
    if (loggedInUser && userRole === 'student') {
      fetchUserProfile(loggedInUser.studentId);
    } else {
      setUserProfile(null);
    }
  }, [loggedInUser, userRole]);

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => {
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev;
      }
      return [...prev, { id, message, type }];
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // API Call Helpers
  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE}/books`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        setIsUsingMockDb(false);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn('Error fetching books from backend, falling back to LocalStorage:', err);
      setIsUsingMockDb(true);
      const localBooks = localStorage.getItem('ritika_library_books');
      if (localBooks) {
        setBooks(JSON.parse(localBooks));
      } else {
        localStorage.setItem('ritika_library_books', JSON.stringify(DEFAULT_BOOKS));
        setBooks(DEFAULT_BOOKS);
      }
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/logs`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceLogs(data);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn('Error fetching logs from backend, falling back to LocalStorage:', err);
      const localLogs = localStorage.getItem('ritika_library_attendance');
      if (localLogs) {
        setAttendanceLogs([...JSON.parse(localLogs)].reverse());
      } else {
        localStorage.setItem('ritika_library_attendance', JSON.stringify(DEFAULT_ATTENDANCE));
        setAttendanceLogs([...DEFAULT_ATTENDANCE].reverse());
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const data = await res.json();
        setRegisteredUsers(data);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn('Error fetching users from backend, falling back to LocalStorage:', err);
      const localUsers = localStorage.getItem('ritika_library_users');
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        const lightUsers = parsed.map(u => ({
          studentId: u.studentId,
          name: u.name,
          registeredAt: u.registeredAt
        }));
        setRegisteredUsers(lightUsers);
      } else {
        localStorage.setItem('ritika_library_users', JSON.stringify(DEFAULT_USERS));
        const lightUsers = DEFAULT_USERS.map(u => ({
          studentId: u.studentId,
          name: u.name,
          registeredAt: u.registeredAt
        }));
        setRegisteredUsers(lightUsers);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`);
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn('Error fetching orders from backend, falling back to LocalStorage:', err);
      const localOrders = localStorage.getItem('ritika_library_orders');
      if (localOrders) {
        setAllOrders(JSON.parse(localOrders));
      } else {
        setAllOrders([]);
      }
    }
  };

  const fetchUserProfile = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/users/profile/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn('Error fetching profile from backend, falling back to LocalStorage:', err);
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const user = localUsers.find(u => u.studentId.toLowerCase() === studentId.toLowerCase());
      if (user) {
        const localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
        const issuedBooks = localBooks.filter(b => b.issuedTo === user.studentId).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          genre: b.genre,
          dueDate: b.dueDate
        }));

        const localOrders = JSON.parse(localStorage.getItem('ritika_library_orders') || '[]');
        const requestedBooks = localOrders.filter(o => o.requestedBy === user.name || o.requestedBy === studentId);

        const localAttendance = JSON.parse(localStorage.getItem('ritika_library_attendance') || JSON.stringify(DEFAULT_ATTENDANCE));
        const userAttendance = localAttendance.filter(a => a.studentId === user.studentId).reverse(); // newest first

        setUserProfile({
          studentId: user.studentId,
          name: user.name,
          registeredAt: user.registeredAt,
          issuedBooksCount: issuedBooks.length,
          issuedBooks,
          requestedBooks,
          attendanceHistory: userAttendance
        });
      } else {
        setUserProfile(null);
      }
    }
  };

  // 1. Auto-attendance face capture handler
  const [isProcessingAutoAttendance, setIsProcessingAutoAttendance] = useState(false);
  const handleAutoAttendanceFace = async (descriptor) => {
    if (isProcessingAutoAttendance) return;
    setIsProcessingAutoAttendance(true);

    try {
      const res = await fetch(`${API_BASE}/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: descriptor })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.alreadyMarked) {
          addToast(`${data.studentName} (${data.studentId}) - Attendance already logged for today!`, 'info');
        } else {
          addToast(`Welcome ${data.studentName}! Attendance logged at ${data.time}`, 'success');
          fetchLogs(); // refresh logs
        }
        // cooldown period so it doesn't instantly double scan
        setTimeout(() => {
          setIsProcessingAutoAttendance(false);
        }, 5000);
      } else {
        console.warn(data.error);
        addToast(data.error || 'Face not recognized. Please register first!', 'error');
        setTimeout(() => {
          setIsProcessingAutoAttendance(false);
        }, 3000);
      }
    } catch (err) {
      // Local fallback
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      let matchedUser = null;
      let minDistance = 999.0;
      const threshold = 0.60;

      for (const user of localUsers) {
        const dist = euclideanDistance(descriptor, user.faceDescriptor);
        if (dist < minDistance) {
          minDistance = dist;
          matchedUser = user;
        }
      }

      if (minDistance > threshold || !matchedUser) {
        addToast('Face not recognized. Please register first or adjust lighting.', 'error');
        setTimeout(() => {
          setIsProcessingAutoAttendance(false);
        }, 3000);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTimeStr = new Date().toTimeString().split(' ')[0];

        let localAttendance = JSON.parse(localStorage.getItem('ritika_library_attendance') || JSON.stringify(DEFAULT_ATTENDANCE));
        const alreadyMarked = localAttendance.some(
          log => log.studentId === matchedUser.studentId && log.date === todayStr
        );

        if (alreadyMarked) {
          addToast(`${matchedUser.name} (${matchedUser.studentId}) - Attendance already logged for today!`, 'info');
        } else {
          const newLog = {
            studentId: matchedUser.studentId,
            name: matchedUser.name,
            date: todayStr,
            time: nowTimeStr,
            method: 'Auto-Scan'
          };
          localStorage.setItem('ritika_library_attendance', JSON.stringify([...localAttendance, newLog]));
          addToast(`Welcome ${matchedUser.name}! Attendance logged locally at ${nowTimeStr}`, 'success');
          fetchLogs();
        }
        setTimeout(() => {
          setIsProcessingAutoAttendance(false);
        }, 5000);
      }
    }
  };

  // 2. Search student name autocomplete and verification
  useEffect(() => {
    if (!searchName.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = registeredUsers.filter(u => 
      u.name.toLowerCase().includes(searchName.toLowerCase()) || 
      u.studentId.toLowerCase().includes(searchName.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchName, registeredUsers]);

  const handleSearchSelect = (user) => {
    setSelectedSearchUser(user);
    setSearchName(user.name);
    setSearchResults([]);
    setIsVerifyingSearchFace(true);
  };

  const handleVerifySearchFace = async (descriptor) => {
    if (isProcessingSearchAttendance || !selectedSearchUser) return;
    setIsProcessingSearchAttendance(true);

    try {
      const res = await fetch(`${API_BASE}/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: selectedSearchUser.studentId,
          faceDescriptor: descriptor 
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.alreadyMarked) {
          addToast(`Attendance already logged today for ${data.studentName}!`, 'info');
        } else {
          addToast(`Verified! Attendance logged for ${data.studentName}`, 'success');
          fetchLogs();
        }
        // Clean up state
        setSearchName('');
        setSelectedSearchUser(null);
        setIsVerifyingSearchFace(false);
      } else {
        addToast(data.error || 'Face verification failed', 'error');
      }
    } catch (err) {
      // Local fallback
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const targetUser = localUsers.find(u => u.studentId.toLowerCase() === selectedSearchUser.studentId.toLowerCase());
      
      if (!targetUser) {
        addToast('Student not found in local database', 'error');
        setIsProcessingSearchAttendance(false);
        return;
      }

      const dist = euclideanDistance(descriptor, targetUser.faceDescriptor);
      const threshold = 0.60;

      if (dist < threshold) {
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTimeStr = new Date().toTimeString().split(' ')[0];

        let localAttendance = JSON.parse(localStorage.getItem('ritika_library_attendance') || JSON.stringify(DEFAULT_ATTENDANCE));
        const alreadyMarked = localAttendance.some(
          log => log.studentId === targetUser.studentId && log.date === todayStr
        );

        if (alreadyMarked) {
          addToast(`Attendance already logged today for ${targetUser.name}!`, 'info');
        } else {
          const newLog = {
            studentId: targetUser.studentId,
            name: targetUser.name,
            date: todayStr,
            time: nowTimeStr,
            method: 'Face Verify'
          };
          localStorage.setItem('ritika_library_attendance', JSON.stringify([...localAttendance, newLog]));
          addToast(`Verified! Attendance logged locally for ${targetUser.name}`, 'success');
          fetchLogs();
        }

        setSearchName('');
        setSelectedSearchUser(null);
        setIsVerifyingSearchFace(false);
      } else {
        addToast('Face verification failed. Face does not match the record.', 'error');
      }
    } finally {
      setIsProcessingSearchAttendance(false);
    }
  };

  // 3. Text Login Dashboard Handler
  useEffect(() => {
    if (!loginIdInput.trim()) {
      setLoginSearchResults([]);
      return;
    }
    const filtered = registeredUsers.filter(u => 
      u.name.toLowerCase().includes(loginIdInput.toLowerCase()) || 
      u.studentId.toLowerCase().includes(loginIdInput.toLowerCase())
    );
    setLoginSearchResults(filtered.slice(0, 5));
  }, [loginIdInput, registeredUsers]);

  const handleStudentTextLogin = async (studentId, password) => {
    if (!studentId.trim() || !password.trim()) {
      addToast('Please enter both Student ID and Password', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/login_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setLoggedInUser({ studentId: data.studentId, name: data.name });
        setUserRole('student');
        setIsLoggedIn(true);
        setCurrentView('home');
        addToast(`Access Granted. Welcome back, ${data.name}!`, 'success');
        setLoginIdInput('');
        setLoginPasswordInput('');
        setLoginSearchResults([]);
      } else {
        addToast(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      // Local fallback
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const user = localUsers.find(u => u.studentId.toLowerCase() === studentId.trim().toLowerCase());
      if (user) {
        const expectedPassword = user.password || "123";
        if (password.trim() === expectedPassword) {
          setLoggedInUser({ studentId: user.studentId, name: user.name });
          setUserRole('student');
          setIsLoggedIn(true);
          setCurrentView('home');
          addToast(`Access Granted. Welcome back, ${user.name}! (Offline Mode)`, 'success');
          setLoginIdInput('');
          setLoginPasswordInput('');
          setLoginSearchResults([]);
        } else {
          addToast('Invalid password! (Offline Mode)', 'error');
        }
      } else {
        addToast('Student ID not found in local database. Please register first.', 'error');
      }
    }
  };

  const handleStudentFaceLogin = async (descriptor) => {
    if (isProcessingFaceLogin) return;
    setIsProcessingFaceLogin(true);

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: descriptor })
      });
      const data = await res.json();
      if (res.ok) {
        // Auto mark attendance upon login
        try {
          await fetch(`${API_BASE}/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: data.studentId, faceDescriptor: descriptor })
          });
        } catch (e) {
          console.warn("Auto attendance failed during login:", e);
        }

        setLoggedInUser({ studentId: data.studentId, name: data.name });
        setUserRole('student');
        setIsLoggedIn(true);
        setCurrentView('home');
        addToast(`Access Granted. Welcome back, ${data.name}!`, 'success');
        fetchLogs();
        setIsProcessingFaceLogin(false);
      } else {
        addToast(data.error || 'Face not recognized. Access Denied.', 'error');
        setTimeout(() => {
          setIsProcessingFaceLogin(false);
        }, 3000); // 3-second cooldown on error
      }
    } catch (err) {
      // Local fallback
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      let matchedUser = null;
      let minDistance = 999.0;
      const threshold = 0.60;

      for (const user of localUsers) {
        const dist = euclideanDistance(descriptor, user.faceDescriptor);
        if (dist < minDistance) {
          minDistance = dist;
          matchedUser = user;
        }
      }

      if (minDistance < threshold && matchedUser) {
        // Auto mark attendance locally
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTimeStr = new Date().toTimeString().split(' ')[0];
        let localAttendance = JSON.parse(localStorage.getItem('ritika_library_attendance') || JSON.stringify(DEFAULT_ATTENDANCE));
        const alreadyMarked = localAttendance.some(
          log => log.studentId === matchedUser.studentId && log.date === todayStr
        );
        if (!alreadyMarked) {
          const newLog = {
            studentId: matchedUser.studentId,
            name: matchedUser.name,
            date: todayStr,
            time: nowTimeStr,
            method: 'Face Verify'
          };
          localStorage.setItem('ritika_library_attendance', JSON.stringify([...localAttendance, newLog]));
          fetchLogs();
        }

        setLoggedInUser({ studentId: matchedUser.studentId, name: matchedUser.name });
        setUserRole('student');
        setIsLoggedIn(true);
        setCurrentView('home');
        addToast(`Access Granted. Welcome back, ${matchedUser.name}! (Offline Mode)`, 'success');
        setIsProcessingFaceLogin(false);
      } else {
        addToast('Face not recognized. Please register first or adjust lighting.', 'error');
        setTimeout(() => {
          setIsProcessingFaceLogin(false);
        }, 3000); // 3-second cooldown on error
      }
    }
  };

  const handleUnifiedFaceScan = async (descriptor) => {
    const rollId = loginIdInput.trim();
    if (!rollId) {
      // Fallback to purely face-based login if Roll ID is empty
      await handleStudentFaceLogin(descriptor);
      return;
    }

    const isRegistered = registeredUsers.some(u => u.studentId.toLowerCase() === rollId.toLowerCase());

    if (isRegistered) {
      // Returning student: auto login using face descriptor
      if (isProcessingFaceLogin) return;
      setIsProcessingFaceLogin(true);

      try {
        const res = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: rollId, faceDescriptor: descriptor }) // Pass studentId for specific matching
        });
        const data = await res.json();
        if (res.ok) {
          // Auto mark attendance
          try {
            await fetch(`${API_BASE}/attendance/mark`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentId: data.studentId, faceDescriptor: descriptor })
            });
          } catch (e) {
            console.warn("Auto attendance failed during login:", e);
          }
          
          setLoggedInUser({ studentId: data.studentId, name: data.name });
          setUserRole('student');
          setIsLoggedIn(true);
          setCurrentView('home');
          addToast(`Access Granted. Welcome back, ${data.name}!`, 'success');
          fetchLogs();
          setLoginIdInput('');
          setLoginSearchResults([]);
          setIsProcessingFaceLogin(false);
        } else {
          addToast(data.error || 'Face not recognized. Access Denied.', 'error');
          setTimeout(() => {
            setIsProcessingFaceLogin(false);
          }, 3000); // 3-second cooldown on error
        }
      } catch (err) {
        // Local fallback
        const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
        const targetUser = localUsers.find(u => u.studentId.toLowerCase() === rollId.toLowerCase());
        if (targetUser) {
          const dist = euclideanDistance(descriptor, targetUser.faceDescriptor);
          if (dist < 0.60) {
            // Auto mark attendance locally
            const todayStr = new Date().toISOString().split('T')[0];
            const nowTimeStr = new Date().toTimeString().split(' ')[0];
            let localAttendance = JSON.parse(localStorage.getItem('ritika_library_attendance') || JSON.stringify(DEFAULT_ATTENDANCE));
            const alreadyMarked = localAttendance.some(
              log => log.studentId === targetUser.studentId && log.date === todayStr
            );
            if (!alreadyMarked) {
              const newLog = {
                studentId: targetUser.studentId,
                name: targetUser.name,
                date: todayStr,
                time: nowTimeStr,
                method: 'Face Verify'
              };
              localStorage.setItem('ritika_library_attendance', JSON.stringify([...localAttendance, newLog]));
              fetchLogs();
            }

            setLoggedInUser({ studentId: targetUser.studentId, name: targetUser.name });
            setUserRole('student');
            setIsLoggedIn(true);
            setCurrentView('home');
            addToast(`Access Granted. Welcome back, ${targetUser.name}! (Offline Mode)`, 'success');
            setLoginIdInput('');
            setLoginSearchResults([]);
            setIsProcessingFaceLogin(false);
          } else {
            addToast('Face verification failed. Face does not match the record.', 'error');
            setTimeout(() => {
              setIsProcessingFaceLogin(false);
            }, 3000); // 3-second cooldown on error
          }
        } else {
          addToast('Student not found in local database.', 'error');
          setTimeout(() => {
            setIsProcessingFaceLogin(false);
          }, 3000); // 3-second cooldown on error
        }
      }
    } else {
      // Inputted ID is not registered, let's inform the user
      if (isProcessingFaceLogin) return;
      setIsProcessingFaceLogin(true);
      addToast(`Student ID "${rollId}" is not registered yet. Please register first or clear the input to login purely with Face ID.`, 'error');
      setTimeout(() => {
        setIsProcessingFaceLogin(false);
      }, 3000); // 3-second cooldown on error
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'gourav289') {
      setLoggedInUser({ name: 'Administrator' });
      setUserRole('admin');
      setIsLoggedIn(true);
      setCurrentView('admin-dashboard');
      addToast('Authorized successfully! Welcome to Admin Panel.', 'success');
      setAdminPassword('');
    } else {
      addToast('Invalid password! Access Denied.', 'error');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUserRole('guest');
    setIsLoggedIn(false);
    setCurrentView('home');
    setUserProfile(null);
    setAdminActiveTab('overview');
    addToast('Logged out successfully', 'info');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Book request has been ${newStatus.toLowerCase()} successfully!`, 'success');
        fetchOrders();
        fetchBooks();
      } else {
        addToast(data.error || 'Failed to update request', 'error');
      }
    } catch (err) {
      // Local fallback
      let localOrders = JSON.parse(localStorage.getItem('ritika_library_orders') || '[]');
      const orderIdx = localOrders.findIndex(o => o.id === orderId);
      if (orderIdx !== -1) {
        localOrders[orderIdx].status = newStatus;
        localStorage.setItem('ritika_library_orders', JSON.stringify(localOrders));

        if (newStatus === 'Approved') {
          let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
          const maxId = localBooks.reduce((max, b) => b.id > max ? b.id : max, 0);
          const newBook = {
            id: maxId + 1,
            title: localOrders[orderIdx].title,
            author: localOrders[orderIdx].author,
            genre: 'Programming & Tech',
            available: true,
            issuedTo: null,
            issuedName: null,
            dueDate: null
          };
          localBooks.push(newBook);
          localStorage.setItem('ritika_library_books', JSON.stringify(localBooks));
          fetchBooks();
        }
        addToast(`Book request has been ${newStatus.toLowerCase()} locally!`, 'success');
        fetchOrders();
      }
    }
  };

  const handleViewStudentDetails = async (student) => {
    setSelectedAdminStudent(student);
    setIsLoadingAdminProfile(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile/${student.studentId}`);
      if (res.ok) {
        const data = await res.json();
        setAdminStudentProfile(data);
      } else {
        throw new Error("API returned error status");
      }
    } catch (err) {
      console.warn('Error fetching student profile, fallback to localStorage/local states:', err);
      // Fallback
      const localBooks = books.filter(b => b.issuedTo === student.studentId);
      const localOrders = allOrders.filter(o => o.requestedBy === student.name || o.requestedBy === student.studentId);
      const localAttendance = attendanceLogs.filter(a => a.studentId === student.studentId);

      setAdminStudentProfile({
        studentId: student.studentId,
        name: student.name,
        registeredAt: student.registeredAt,
        issuedBooksCount: localBooks.length,
        issuedBooks: localBooks,
        requestedBooks: localOrders,
        attendanceHistory: localAttendance
      });
    } finally {
      setIsLoadingAdminProfile(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to deregister this student? All currently issued books will be returned.")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${studentId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Student deregistered successfully!', 'success');
        fetchUsers();
        fetchBooks();
      } else {
        addToast(data.error || 'Failed to delete student', 'error');
      }
    } catch (err) {
      // Local fallback
      let localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const filteredUsers = localUsers.filter(u => u.studentId !== studentId);
      localStorage.setItem('ritika_library_users', JSON.stringify(filteredUsers));

      let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
      const updatedBooks = localBooks.map(book => {
        if (book.issuedTo === studentId) {
          return { ...book, available: true, issuedTo: null, issuedName: null, dueDate: null };
        }
        return book;
      });
      localStorage.setItem('ritika_library_books', JSON.stringify(updatedBooks));

      addToast('Student deregistered locally!', 'success');
      fetchUsers();
      fetchBooks();
    }
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      addToast('Title and Author are required', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBookTitle.trim(),
          author: newBookAuthor.trim(),
          genre: newBookGenre
        })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`"${newBookTitle}" added to the library catalog!`, 'success');
        setNewBookTitle('');
        setNewBookAuthor('');
        fetchBooks();
      } else {
        addToast(data.error || 'Failed to add book', 'error');
      }
    } catch (err) {
      // Local fallback
      let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
      const maxId = localBooks.reduce((max, b) => b.id > max ? b.id : max, 0);
      const newBook = {
        id: maxId + 1,
        title: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        genre: newBookGenre,
        available: true,
        issuedTo: null,
        issuedName: null,
        dueDate: null
      };
      localBooks.push(newBook);
      localStorage.setItem('ritika_library_books', JSON.stringify(localBooks));

      addToast(`"${newBookTitle}" added locally!`, 'success');
      setNewBookTitle('');
      setNewBookAuthor('');
      fetchBooks();
    }
  };

  // 4. Register face and student (Auto-logs in on success)
  const handleRegisterFace = async (descriptor) => {
    if (!regFaceDescriptor) {
      addToast('Face ID features extracted successfully! Click submit below.', 'success');
    }
    setRegFaceDescriptor(descriptor);
  };

  const handleRegisterSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalId = (regId.trim() || loginIdInput.trim());
    const finalName = regName.trim();
    const finalPassword = regPassword.trim();
    if (!finalName || !finalId || !finalPassword) {
      addToast('Please enter Name, Student ID, and Password', 'error');
      return;
    }
    if (!regFaceDescriptor) {
      addToast('Please capture your Face ID first using the camera', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: finalId,
          name: finalName,
          password: finalPassword,
          faceDescriptor: regFaceDescriptor
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Registration Successful!', 'success');
        fetchUsers();
        
        // Auto Log In
        setLoggedInUser({ studentId: finalId, name: finalName });
        setUserRole('student');
        setIsLoggedIn(true);
        setCurrentView('home');
        addToast(`Welcome to your dashboard, ${finalName}!`, 'success');

        // Reset fields
        setRegName('');
        setRegId('');
        setRegPassword('');
        setLoginIdInput('');
        setRegFaceDescriptor(null);
      } else {
        addToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      // Local fallback
      let localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const existingUserIdx = localUsers.findIndex(u => u.studentId.toLowerCase() === finalId.toLowerCase());
      
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (existingUserIdx !== -1) {
        localUsers[existingUserIdx].name = finalName;
        localUsers[existingUserIdx].password = finalPassword;
        localUsers[existingUserIdx].faceDescriptor = regFaceDescriptor;
        localUsers[existingUserIdx].registeredAt = timestamp;
        addToast('Face ID and Password updated successfully in local database!', 'success');
      } else {
        const newUser = {
          studentId: finalId,
          name: finalName,
          password: finalPassword,
          faceDescriptor: regFaceDescriptor,
          registeredAt: timestamp
        };
        localUsers.push(newUser);
        addToast('Student registered with Face ID and Password successfully in local database!', 'success');
      }

      localStorage.setItem('ritika_library_users', JSON.stringify(localUsers));
      fetchUsers();

      // Auto Log In
      setLoggedInUser({ studentId: finalId, name: finalName });
      setUserRole('student');
      setIsLoggedIn(true);
      setCurrentView('home');
      addToast(`Welcome to your dashboard, ${finalName}!`, 'success');

      // Reset fields
      setRegName('');
      setRegId('');
      setRegPassword('');
      setLoginIdInput('');
      setRegFaceDescriptor(null);
    } finally {
      setIsRegistering(false);
    }
  };

  // 5. Order/Suggest a new book
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderTitle.trim() || !orderAuthor.trim()) {
      addToast('Title and Author are required', 'error');
      return;
    }

    const requester = loggedInUser ? loggedInUser.name : 'Guest Student';

    try {
      const res = await fetch(`${API_BASE}/books/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: orderTitle.trim(),
          author: orderAuthor.trim(),
          requestedBy: requester,
          reason: orderReason.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Book request submitted for review!', 'success');
        setOrderTitle('');
        setOrderAuthor('');
        setOrderReason('');
        setIsOrderModalOpen(false);
        if (loggedInUser) fetchUserProfile(loggedInUser.studentId); // refresh dashboard
      } else {
        addToast(data.error || 'Failed to submit request', 'error');
      }
    } catch (err) {
      // Local fallback
      let localOrders = JSON.parse(localStorage.getItem('ritika_library_orders') || '[]');
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newOrder = {
        id: localOrders.length + 1,
        title: orderTitle.trim(),
        author: orderAuthor.trim(),
        requestedBy: requester,
        reason: orderReason.trim(),
        status: 'Pending',
        date: timestamp
      };
      localOrders.push(newOrder);
      localStorage.setItem('ritika_library_orders', JSON.stringify(localOrders));

      addToast('Book request submitted locally for review!', 'success');
      setOrderTitle('');
      setOrderAuthor('');
      setOrderReason('');
      setIsOrderModalOpen(false);
      if (loggedInUser) fetchUserProfile(loggedInUser.studentId);
    }
  };

  // 6. Issue Book Text Form Handler
  useEffect(() => {
    if (!issueIdInput.trim()) {
      setIssueSearchResults([]);
      return;
    }
    const filtered = registeredUsers.filter(u => 
      u.name.toLowerCase().includes(issueIdInput.toLowerCase()) || 
      u.studentId.toLowerCase().includes(issueIdInput.toLowerCase())
    );
    setIssueSearchResults(filtered.slice(0, 5));
  }, [issueIdInput, registeredUsers]);

  const handleIssueRequest = async (book) => {
    setIssuingBook(book);
    
    // If student is already logged in, issue the book directly to them
    if (loggedInUser) {
      setIsProcessingIssue(true);
      try {
        const res = await fetch(`${API_BASE}/books/issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id,
            studentId: loggedInUser.studentId,
            studentName: loggedInUser.name
          })
        });

        const data = await res.json();
        if (res.ok) {
          addToast(`Success! "${book.title}" issued to your account`, 'success');
          fetchBooks();
          fetchUserProfile(loggedInUser.studentId);
        } else {
          addToast(data.error || 'Failed to issue book', 'error');
        }
      } catch (err) {
        // Local fallback
        let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
        const bookIdx = localBooks.findIndex(b => b.id === book.id);
        if (bookIdx !== -1) {
          if (!localBooks[bookIdx].available) {
            addToast(`Book is already issued to ${localBooks[bookIdx].issuedName || 'someone else'}`, 'error');
            setIsProcessingIssue(false);
            setIssuingBook(null);
            return;
          }

          const today = new Date();
          today.setDate(today.getDate() + 14);
          const dueDateStr = today.toISOString().split('T')[0];

          localBooks[bookIdx].available = false;
          localBooks[bookIdx].issuedTo = loggedInUser.studentId;
          localBooks[bookIdx].issuedName = loggedInUser.name;
          localBooks[bookIdx].dueDate = dueDateStr;

          localStorage.setItem('ritika_library_books', JSON.stringify(localBooks));
          addToast(`Success! "${book.title}" issued to your account locally`, 'success');
          fetchBooks();
          fetchUserProfile(loggedInUser.studentId);
        }
      } finally {
        setIsProcessingIssue(false);
        setIssuingBook(null);
      }
    } else {
      // If not logged in, open select student ID modal
      setIssueIdInput('');
      setIsIssueModalOpen(true);
    }
  };

  const handleIssueSubmit = async (selectedStudent) => {
    if (!selectedStudent && !issueIdInput.trim()) {
      addToast('Please enter your Student ID', 'error');
      return;
    }

    const targetStudentId = selectedStudent ? selectedStudent.studentId : issueIdInput.trim();
    const targetStudentName = selectedStudent ? selectedStudent.name : '';

    setIsProcessingIssue(true);
    try {
      let finalName = targetStudentName;
      if (!finalName) {
        const userRes = await fetch(`${API_BASE}/users/profile/${targetStudentId}`);
        if (userRes.ok) {
          const data = await userRes.json();
          finalName = data.name;
        } else {
          addToast('Student ID not found. Please register first.', 'error');
          setIsProcessingIssue(false);
          return;
        }
      }

      const res = await fetch(`${API_BASE}/books/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: issuingBook.id,
          studentId: targetStudentId,
          studentName: finalName
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`Success! "${issuingBook.title}" issued to ${finalName}`, 'success');
        fetchBooks();
        setIsIssueModalOpen(false);
        setIssuingBook(null);
      } else {
        addToast(data.error || 'Failed to issue book', 'error');
      }
    } catch (err) {
      // Local fallback
      let finalName = targetStudentName;
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const user = localUsers.find(u => u.studentId.toLowerCase() === targetStudentId.toLowerCase());
      
      if (!user) {
        addToast('Student ID not found in local database. Please register first.', 'error');
        setIsProcessingIssue(false);
        return;
      }
      finalName = user.name;

      let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
      const bookIdx = localBooks.findIndex(b => b.id === issuingBook.id);

      if (bookIdx !== -1) {
        if (!localBooks[bookIdx].available) {
          addToast(`Book is already issued to ${localBooks[bookIdx].issuedName || 'someone else'}`, 'error');
          setIsProcessingIssue(false);
          return;
        }

        const today = new Date();
        today.setDate(today.getDate() + 14);
        const dueDateStr = today.toISOString().split('T')[0];

        localBooks[bookIdx].available = false;
        localBooks[bookIdx].issuedTo = user.studentId;
        localBooks[bookIdx].issuedName = finalName;
        localBooks[bookIdx].dueDate = dueDateStr;

        localStorage.setItem('ritika_library_books', JSON.stringify(localBooks));
        addToast(`Success! "${issuingBook.title}" issued to ${finalName} locally`, 'success');
        fetchBooks();
        setIsIssueModalOpen(false);
        setIssuingBook(null);
      }
    } finally {
      setIsProcessingIssue(false);
    }
  };

  // 7. Return Book
  const handleReturnBook = async (bookId) => {
    try {
      const res = await fetch(`${API_BASE}/books/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Book returned to library shelves!', 'success');
        fetchBooks();
        if (loggedInUser) fetchUserProfile(loggedInUser.studentId);
      } else {
        addToast(data.error || 'Failed to return book', 'error');
      }
    } catch (err) {
      // Local fallback
      let localBooks = JSON.parse(localStorage.getItem('ritika_library_books') || JSON.stringify(DEFAULT_BOOKS));
      const bookIdx = localBooks.findIndex(b => b.id === bookId);
      if (bookIdx !== -1) {
        if (localBooks[bookIdx].available) {
          addToast('Book is already available in the library', 'error');
          return;
        }

        localBooks[bookIdx].available = true;
        localBooks[bookIdx].issuedTo = null;
        localBooks[bookIdx].issuedName = null;
        localBooks[bookIdx].dueDate = null;

        localStorage.setItem('ritika_library_books', JSON.stringify(localBooks));
        addToast('Book returned to library shelves locally!', 'success');
        fetchBooks();
        if (loggedInUser) fetchUserProfile(loggedInUser.studentId);
      }
    }
  };

  // Curated Categories List
  const genres = ['All', 'Programming & Tech', 'Science & Humanity', 'Self-Help & Business', 'Fiction & Literature', 'Fantasy & Adventure'];

  // Helper to resolve book cover gradient based on category
  const getCoverClass = (genre) => {
    if (genre.includes('Programming')) return 'cover-programming';
    if (genre.includes('Science')) return 'cover-science';
    if (genre.includes('Self-Help') || genre.includes('Business')) return 'cover-self-help';
    if (genre.includes('Fiction')) return 'cover-fiction';
    if (genre.includes('Fantasy')) return 'cover-fantasy';
    return 'cover-default';
  };

  // Filters books by Search input
  const matchesSearch = (book) => {
    return book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           book.author.toLowerCase().includes(searchQuery.toLowerCase());
  };

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`toast toast-${t.type} glass-panel`}
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              style={{ cursor: 'pointer' }}
              title="Click to dismiss"
            >
              <div className="toast-icon">
                {t.type === 'success' && <CheckCircle2 size={16} />}
                {t.type === 'error' && <AlertTriangle size={16} />}
                {t.type === 'info' && <Info size={16} />}
              </div>
              <div style={{ flex: 1 }}>{t.message}</div>
              <div style={{ opacity: 0.6, fontSize: '12px', fontWeight: 'bold', marginLeft: '12px', userSelect: 'none' }}>×</div>
            </div>
          ))}
        </div>

        <header className="app-header">
          <nav className="nav-container" style={{ justifyContent: 'center' }}>
            <div className="brand">
              <div className="brand-icon">
                <BookOpen size={20} color="#fff" />
              </div>
              <span className="brand-text">Library</span>
            </div>
          </nav>
        </header>

        <main className="auth-landing-container">
          <div className={`auth-card glass-panel ${authTab === 'student' ? 'auth-card-wide' : ''}`}>
            <div className="auth-header">
              <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-glow)', borderRadius: '50%', marginBottom: '12px', color: 'var(--primary)' }}>
                <BookOpen size={28} />
              </div>
              <h2>Library Portal</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
                Please sign in to access the catalog, scanner, and portal.
              </p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authTab === 'student' ? 'active' : ''}`}
                onClick={() => setAuthTab('student')}
              >
                🎓 Student Login / Register
              </button>
              <button 
                className={`auth-tab ${authTab === 'admin' ? 'active' : ''}`}
                onClick={() => setAuthTab('admin')}
              >
                🔑 Admin Login
              </button>
            </div>

            {authTab === 'student' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', margin: '0 auto', textAlign: 'left', width: '100%' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', textAlign: 'center' }}>
                  Student Portal
                </h3>

                {/* Sub-tabs: Login & Sign Up */}
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(124, 58, 237, 0.05)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setStudentSubTab('login');
                      setRegFaceDescriptor(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: studentSubTab === 'login' ? 'var(--primary)' : 'transparent',
                      color: studentSubTab === 'login' ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔑 Sign In / Login
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setStudentSubTab('register');
                      setRegFaceDescriptor(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: studentSubTab === 'register' ? 'var(--primary)' : 'transparent',
                      color: studentSubTab === 'register' ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📝 New User (Sign Up)
                  </button>
                </div>

                {studentSubTab === 'login' ? (
                  /* --- SUB-TAB: STUDENT LOGIN --- */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                      <label htmlFor="studentId">Student Roll No / ID</label>
                      <div className="search-input-wrapper">
                        <User size={15} className="search-icon" />
                        <input 
                          type="text" 
                          id="studentId"
                          placeholder="Type Student ID or Search Name..."
                          value={loginIdInput}
                          onChange={(e) => setLoginIdInput(e.target.value)}
                          className="app-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStudentTextLogin(loginIdInput, loginPasswordInput);
                          }}
                        />
                      </div>
                      {loginSearchResults.length > 0 && (
                        <ul className="search-results">
                          {loginSearchResults.map(user => (
                            <li 
                              key={user.studentId} 
                              onClick={() => {
                                setLoginIdInput(user.studentId);
                                setLoginSearchResults([]);
                              }}
                              className="result-item"
                            >
                              <span>{user.name}</span>
                              <span className="result-item-id">{user.studentId}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="input-group">
                      <label htmlFor="studentPassword">Password</label>
                      <input 
                        type="password" 
                        id="studentPassword"
                        placeholder="Enter password..."
                        value={loginPasswordInput}
                        onChange={(e) => setLoginPasswordInput(e.target.value)}
                        className="app-input"
                        style={{ paddingLeft: '12px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleStudentTextLogin(loginIdInput, loginPasswordInput);
                        }}
                      />
                    </div>

                    <button 
                      onClick={() => handleStudentTextLogin(loginIdInput, loginPasswordInput)}
                      className="app-btn btn-cyan"
                      style={{ width: '100%' }}
                      disabled={!loginIdInput.trim() || !loginPasswordInput.trim()}
                    >
                      <LogIn size={14} /> Login with ID & Password
                    </button>

                    <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                      —— OR USE FACE ID ——
                    </div>

                    <WebcamCapture 
                      mode="verify"
                      onFaceDetected={handleUnifiedFaceScan}
                      isProcessing={isProcessingFaceLogin}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-6px' }}>
                      Position your face to automatically verify and login (registered users only).
                    </div>
                  </div>
                ) : (
                  /* --- SUB-TAB: STUDENT REGISTER (SIGN UP) --- */
                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <div className="input-group">
                      <label htmlFor="regId">Roll No / Student ID</label>
                      <input 
                        type="text" 
                        id="regId"
                        placeholder="e.g. S-2026-104"
                        value={regId}
                        onChange={(e) => setRegId(e.target.value)}
                        className="app-input"
                        style={{ paddingLeft: '12px' }}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="regName">Student Full Name</label>
                      <input 
                        type="text" 
                        id="regName"
                        placeholder="Enter full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="app-input"
                        style={{ paddingLeft: '12px' }}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="regPassword">Create Password</label>
                      <input 
                        type="password" 
                        id="regPassword"
                        placeholder="Choose a password..."
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="app-input"
                        style={{ paddingLeft: '12px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Scan Face ID
                      </label>
                      <WebcamCapture 
                        mode="register"
                        onFaceDetected={handleRegisterFace}
                        isProcessing={isRegistering}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="app-btn" 
                      disabled={isRegistering || !regFaceDescriptor || !regName.trim() || !regId.trim() || !regPassword.trim()}
                      style={{ width: '100%', marginTop: '12px' }}
                    >
                      {isRegistering ? 'Registering...' : regFaceDescriptor ? '✓ Register & Login' : 'Align Face to Register'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // Admin login form
              <div className="admin-login-form" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', textAlign: 'center' }}>
                  Admin Authorization Gate
                </h3>
                
                <div className="input-group">
                  <label htmlFor="adminPassword">Enter Admin Password</label>
                  <input 
                    type="password" 
                    id="adminPassword"
                    placeholder="Enter password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '12px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdminLogin();
                    }}
                  />
                </div>

                <button 
                  onClick={handleAdminLogin}
                  className="app-btn"
                  style={{ width: '100%' }}
                  disabled={!adminPassword}
                >
                  <ShieldCheck size={14} /> Authorize & Enter
                </button>
              </div>
            )}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>
          <p>© 2026 Library Portal. Smart face-recognition features local.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`toast toast-${t.type} glass-panel`}
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            style={{ cursor: 'pointer' }}
            title="Click to dismiss"
          >
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircle2 size={16} />}
              {t.type === 'error' && <AlertTriangle size={16} />}
              {t.type === 'info' && <Info size={16} />}
            </div>
            <div style={{ flex: 1 }}>{t.message}</div>
            <div style={{ opacity: 0.6, fontSize: '12px', fontWeight: 'bold', marginLeft: '12px', userSelect: 'none' }}>×</div>
          </div>
        ))}
      </div>

      {/* Conditional Header based on userRole */}
      {userRole === 'admin' ? (
        <header className="app-header" style={{ borderBottom: '2px solid var(--primary)' }}>
          <nav className="nav-container">
            <div className="brand">
              <div className="brand-icon" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                <ShieldCheck size={20} color="#fff" />
              </div>
              <span className="brand-text">Library Admin</span>
            </div>
            <ul className="nav-links">
              <li>
                <button 
                  onClick={() => setCurrentView('admin-dashboard')} 
                  className={`nav-btn ${currentView === 'admin-dashboard' ? 'active' : ''}`}
                >
                  <Layers size={15} /> Dashboard Control
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('home')} 
                  className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
                >
                  <BookOpen size={15} /> View Catalog
                </button>
              </li>
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-badge" style={{ background: 'rgba(124, 58, 237, 0.08)', borderColor: 'rgba(124, 58, 237, 0.2)', color: 'var(--primary)' }}>
                <ShieldCheck size={13} />
                <span>Admin</span>
              </div>
              <button onClick={handleLogout} className="nav-btn" style={{ color: '#be123c' }}>
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </nav>
        </header>
      ) : (
        <header className="app-header">
          <nav className="nav-container">
            <a href="#" className="brand" onClick={() => setCurrentView('home')}>
              <div className="brand-icon">
                <BookOpen size={20} color="#fff" />
              </div>
              <span className="brand-text">Library</span>
            </a>

            <ul className="nav-links">
              <li>
                <button 
                  onClick={() => setCurrentView('home')} 
                  className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
                >
                  <BookOpen size={15} /> Books Catalog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('attendance')} 
                  className={`nav-btn ${currentView === 'attendance' ? 'active' : ''}`}
                >
                  <Camera size={15} /> Attendance Scanner
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('dashboard')} 
                  className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                >
                  <FileText size={15} /> Student Portal
                </button>
              </li>
            </ul>

            {loggedInUser && (
              <div className="user-badge" onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
                <User size={13} />
                <span>{loggedInUser.name}</span>
              </div>
            )}
          </nav>
        </header>
      )}

      {/* Main Content Area */}
      <main className="main-content">

        {/* ==================== VIEW: ADMIN DASHBOARD ==================== */}
        {currentView === 'admin-dashboard' && userRole === 'admin' && (
          <div>
            <div className="admin-header-row">
              <div>
                <h2>Admin Management Panel</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Monitor library activity, approve book requests, deregister student profiles, and manage inventory.
                </p>
              </div>
            </div>

            <div className="admin-grid">
              {/* Left Column: Sidebar Navigation */}
              <div className="admin-sidebar glass-panel" style={{ padding: '16px' }}>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setAdminActiveTab('overview')}
                >
                  <Layers size={16} /> Overview Stats
                </button>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'suggestions' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminActiveTab('suggestions');
                    fetchOrders();
                  }}
                >
                  <BookMarked size={16} /> Book Suggestions ({allOrders.filter(o => o.status === 'Pending').length})
                </button>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'students' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminActiveTab('students');
                    fetchUsers();
                  }}
                >
                  <User size={16} /> Student Directory ({registeredUsers.length})
                </button>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'issues' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminActiveTab('issues');
                    fetchBooks();
                  }}
                >
                  <FileText size={16} /> Issued Books ({books.filter(b => !b.available).length})
                </button>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'logs' ? 'active' : ''}`}
                  onClick={() => {
                    setAdminActiveTab('logs');
                    fetchLogs();
                  }}
                >
                  <Clock size={16} /> Attendance Logs ({attendanceLogs.length})
                </button>
                <button 
                  className={`admin-menu-btn ${adminActiveTab === 'add-book' ? 'active' : ''}`}
                  onClick={() => setAdminActiveTab('add-book')}
                >
                  <Plus size={16} /> Add New Books
                </button>
              </div>

              {/* Right Column: Panel Contents */}
              <div className="admin-panel-content">
                
                {/* Tab 1: Overview */}
                {adminActiveTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div className="glass-panel stat-item" style={{ padding: '20px' }}>
                        <span className="stat-label">Total Registered Students</span>
                        <span className="stat-value glow-purple">{registeredUsers.length}</span>
                      </div>
                      <div className="glass-panel stat-item" style={{ padding: '20px' }}>
                        <span className="stat-label">Total Books Catalog</span>
                        <span className="stat-value glow-cyan">{books.length}</span>
                      </div>
                      <div className="glass-panel stat-item" style={{ padding: '20px' }}>
                        <span className="stat-label">Currently Issued Books</span>
                        <span className="stat-value" style={{ color: 'var(--accent-red)' }}>{books.filter(b => !b.available).length}</span>
                      </div>
                      <div className="glass-panel stat-item" style={{ padding: '20px' }}>
                        <span className="stat-label">Attendance Logged Today</span>
                        <span className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.logsToday}</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="var(--primary)" /> Quick System Status
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        Library Face-Recognition management system is fully active. 
                        {isUsingMockDb ? (
                          <strong style={{ color: 'var(--secondary)' }}> Currently running in Local Offline Mode. Data is synchronized with LocalStorage.</strong>
                        ) : (
                          <strong style={{ color: 'var(--accent-green)' }}> Connected successfully to Python Flask API Backend service.</strong>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Book Suggestions (Orders) */}
                {adminActiveTab === 'suggestions' && (
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Student Book Suggestions ({allOrders.length})</h3>
                    
                    {allOrders.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No suggestions submitted by students yet.</p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Title</th>
                              <th>Author</th>
                              <th>Requested By</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allOrders.map(order => (
                              <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{order.date}</td>
                                <td style={{ fontWeight: '700' }}>{order.title}</td>
                                <td>{order.author}</td>
                                <td>{order.requestedBy}</td>
                                <td style={{ fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.reason}>{order.reason || 'N/A'}</td>
                                <td>
                                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  {order.status === 'Pending' ? (
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => handleUpdateOrderStatus(order.id, 'Approved')}
                                        className="app-btn btn-cyan"
                                        style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--accent-green)' }}
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateOrderStatus(order.id, 'Rejected')}
                                        className="app-btn btn-secondary"
                                        style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent-red)', borderColor: 'var(--accent-red-glow)' }}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resolved</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Student Directory */}
                {adminActiveTab === 'students' && (
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Registered Students Directory</h3>
                    
                    {registeredUsers.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No student profiles registered in system yet.</p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>Student Roll ID</th>
                              <th>Student Full Name</th>
                              <th>Registered At</th>
                              <th>Attendance / Check-ins</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...registeredUsers]
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map(student => {
                                const count = attendanceLogs.filter(log => log.studentId === student.studentId).length;
                                return (
                                  <tr 
                                    key={student.studentId} 
                                    onClick={() => handleViewStudentDetails(student)}
                                    style={{ cursor: 'pointer' }}
                                    className="clickable-row"
                                    title="Click to view detailed student profile"
                                  >
                                    <td style={{ fontWeight: '700' }}>{student.studentId}</td>
                                    <td>{student.name}</td>
                                    <td>{student.registeredAt || 'N/A'}</td>
                                    <td>
                                      <span className="status-badge status-approved" style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px' }}>
                                        {count} {count === 1 ? 'check-in' : 'check-ins'}
                                      </span>
                                    </td>
                                    <td>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation(); // prevent modal opening
                                          handleDeleteStudent(student.studentId);
                                        }}
                                        className="app-btn btn-secondary"
                                        style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent-red)', borderColor: 'var(--accent-red-glow)' }}
                                      >
                                        Deregister Profile
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Issued Books */}
                {adminActiveTab === 'issues' && (
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Currently Active Book checkouts</h3>
                    
                    {books.filter(b => !b.available).length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No library books are currently checked out.</p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>Book ID</th>
                              <th>Book Title</th>
                              <th>Author</th>
                              <th>Issued To Student</th>
                              <th>Student ID</th>
                              <th>Due Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {books.filter(b => !b.available).map(book => (
                              <tr key={book.id}>
                                <td>#{book.id}</td>
                                <td style={{ fontWeight: '700' }}>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.issuedName}</td>
                                <td>{book.issuedTo}</td>
                                <td style={{ color: 'var(--accent-red)', fontWeight: '700' }}>{book.dueDate}</td>
                                <td>
                                  <button 
                                    onClick={() => handleReturnBook(book.id)}
                                    className="app-btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}
                                  >
                                    Force Return
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 5: Attendance Logs */}
                {adminActiveTab === 'logs' && (
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Full Scan Attendance Logs ({attendanceLogs.length})</h3>
                    
                    {attendanceLogs.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No attendance log records recorded yet.</p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>Index</th>
                              <th>Student Name</th>
                              <th>Roll ID</th>
                              <th>Time</th>
                              <th>Date</th>
                              <th>Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceLogs.map((log, idx) => (
                              <tr key={idx}>
                                <td>#{attendanceLogs.length - idx}</td>
                                <td style={{ fontWeight: '700' }}>{log.name}</td>
                                <td>{log.studentId}</td>
                                <td>{log.time}</td>
                                <td>{log.date}</td>
                                <td>
                                  <span className={`status-badge ${log.method === 'Face Verify' ? 'status-approved' : 'status-pending'}`}>
                                    {log.method || 'Auto-Scan'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 6: Add Book Form */}
                {adminActiveTab === 'add-book' && (
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Add New Book to Catalog</h3>
                    
                    <form onSubmit={handleAddBookSubmit}>
                      <div className="add-book-grid">
                        <div className="input-group">
                          <label htmlFor="addTitle">Book Title</label>
                          <input 
                            type="text" 
                            id="addTitle" 
                            placeholder="e.g. Design Patterns"
                            value={newBookTitle}
                            onChange={(e) => setNewBookTitle(e.target.value)}
                            className="app-input"
                            style={{ paddingLeft: '12px' }}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label htmlFor="addAuthor">Book Author</label>
                          <input 
                            type="text" 
                            id="addAuthor" 
                            placeholder="e.g. Erich Gamma"
                            value={newBookAuthor}
                            onChange={(e) => setNewBookAuthor(e.target.value)}
                            className="app-input"
                            style={{ paddingLeft: '12px' }}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label htmlFor="addGenre">Genre / Category</label>
                          <select 
                            id="addGenre"
                            value={newBookGenre}
                            onChange={(e) => setNewBookGenre(e.target.value)}
                            className="app-input"
                            style={{ paddingLeft: '12px' }}
                          >
                            <option value="Programming & Tech">Programming & Tech</option>
                            <option value="Science & Humanity">Science & Humanity</option>
                            <option value="Self-Help & Business">Self-Help & Business</option>
                            <option value="Fiction & Literature">Fiction & Literature</option>
                            <option value="Fantasy & Adventure">Fantasy & Adventure</option>
                          </select>
                        </div>
                      </div>
                      
                      <button type="submit" className="app-btn" style={{ marginTop: '8px' }}>
                        <Plus size={14} /> Add Book to Shelves
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW: HOME (E-COMMERCE STYLE SHOWCASE) ==================== */}
        {currentView === 'home' && (
          <div>
            {/* Hero Welcome banner */}
            <div className="homepage-hero">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1>Library Showcase</h1>
                  <p>
                    Browse and check out real-world books across programming, science, self-help, fiction, and fantasy. Instant book issuing powered by Face ID.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {userRole === 'student' && (
                    <button onClick={() => setIsOrderModalOpen(true)} className="app-btn">
                      <Plus size={15} /> Order New Book
                    </button>
                  )}
                  {userRole === 'student' && (
                    <button onClick={() => setCurrentView('attendance')} className="app-btn btn-secondary">
                      <Camera size={15} /> Scan Attendance
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* E-Commerce Search and Category navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div className="input-group" style={{ maxWidth: '600px' }}>
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search books by title, author, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="app-input"
                  />
                </div>
              </div>

              {/* Category selector pills */}
              <div className="category-nav-bar">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedCategory(genre)}
                    className={`category-pill ${selectedCategory === genre ? 'active' : ''}`}
                  >
                    {genre === 'All' && <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Book lists categorized */}
            {books.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p>Loading catalog from database...</p>
              </div>
            ) : (
              <div>
                {genres.filter(g => g !== 'All').map(category => {
                  // Filter books for this category
                  const categoryBooks = books.filter(b => b.genre === category && matchesSearch(b));
                  
                  // Skip displaying category if category pill filter doesn't match
                  if (selectedCategory !== 'All' && selectedCategory !== category) return null;
                  
                  // Skip displaying category if search filters out all books in it
                  if (categoryBooks.length === 0) return null;

                  return (
                    <div key={category} className="category-section">
                      <div className="category-title-row">
                        <h2>{category}</h2>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                          {categoryBooks.length} {categoryBooks.length === 1 ? 'Book' : 'Books'} Available
                        </span>
                      </div>

                      <div className="books-grid">
                        {categoryBooks.map(book => (
                          <div key={book.id} className="book-card">
                            <span className={`book-badge ${book.available ? 'badge-available' : 'badge-issued'}`}>
                              {book.available ? 'AVAILABLE' : 'ISSUED'}
                            </span>
                            
                            {/* Realistic cover visual */}
                            <div className={`book-cover-mock ${getCoverClass(book.genre)}`}>
                              <span className="book-cover-genre">{book.genre}</span>
                              <span className="book-cover-title">{book.title}</span>
                              <span className="book-cover-author">{book.author}</span>
                            </div>

                            <div className="book-info-row">
                              <h3 className="book-title">{book.title}</h3>
                              <p className="book-author">by {book.author}</p>
                              <p className="book-meta">Book ID: #{book.id}</p>
                              
                              {!book.available && (
                                <div style={{ marginTop: '8px', fontSize: '11px', background: '#fff1f2', padding: '6px', borderRadius: '6px', border: '1px solid #ffe4e6' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Issued to: </span>
                                  <strong style={{ color: '#be123c' }}>{book.issuedName}</strong>
                                  <br />
                                  <span style={{ color: 'var(--text-secondary)' }}>Due: </span>
                                  <strong style={{ color: '#be123c' }}>{book.dueDate}</strong>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                              <button 
                                onClick={() => setActiveReadingBook(book)}
                                className="app-btn btn-cyan"
                                style={{ width: '100%' }}
                              >
                                <BookOpen size={14} /> Read Online
                              </button>
                              
                              {book.available ? (
                                <button 
                                  onClick={() => handleIssueRequest(book)}
                                  className="app-btn btn-secondary"
                                  style={{ width: '100%' }}
                                >
                                  Issue Book
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleReturnBook(book.id)}
                                  className="app-btn btn-secondary"
                                  style={{ width: '100%', borderColor: '#fecdd3', color: '#be123c' }}
                                >
                                  Return Book
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Fallback empty view when filtering everything */}
                {selectedCategory !== 'All' && books.filter(b => b.genre === selectedCategory && matchesSearch(b)).length === 0 && (
                  <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <BookMarked size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p>No books matching the filters found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW: ATTENDANCE PORTAL ==================== */}
        {currentView === 'attendance' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2>Attendance Scanner</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Daily student attendance verification. Align your face with the camera or search your name to mark presence.
              </p>
            </div>

            <div className="attendance-layout">
              {/* Webcam Auto Scanner */}
              <div className="glass-panel attendance-card">
                <h3 className="section-title">
                  <Camera size={18} color="var(--primary)" />
                  Camera Auto-Scanner
                </h3>

                {isVerifyingSearchFace ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '10px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', color: '#d97706', fontSize: '12px', fontWeight: 'bold' }}>
                      Face ID matching for: {selectedSearchUser?.name}
                    </div>
                    <WebcamCapture 
                      mode="verify"
                      onFaceDetected={handleVerifySearchFace}
                      isProcessing={isProcessingSearchAttendance}
                      targetStudentId={selectedSearchUser?.studentId}
                    />
                    <button 
                      className="app-btn btn-secondary" 
                      onClick={() => {
                        setIsVerifyingSearchFace(false);
                        setSelectedSearchUser(null);
                        setSearchName('');
                      }}
                    >
                      Cancel Verification
                    </button>
                  </div>
                ) : (
                  <WebcamCapture 
                    mode="scan"
                    onFaceDetected={handleAutoAttendanceFace}
                    isProcessing={isProcessingAutoAttendance}
                  />
                )}
              </div>

              {/* Sidebar: Search fallback and logs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Search Name Fallback */}
                <div className="glass-panel attendance-card">
                  <h3 className="section-title">
                    <Search size={18} color="var(--secondary)" />
                    Search Name to Log
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-8px' }}>
                    Type your name or roll number, select from lists, and scan your face to verify:
                  </p>
                  <div className="input-group">
                    <div className="search-input-wrapper">
                      <Search size={15} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Type registered name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="app-input"
                      />
                    </div>
                    
                    {searchResults.length > 0 && (
                      <ul className="search-results">
                        {searchResults.map(user => (
                          <li 
                            key={user.studentId} 
                            onClick={() => handleSearchSelect(user)}
                            className="result-item"
                          >
                            <span>{user.name}</span>
                            <span className="result-item-id">{user.studentId}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Today's logs */}
                <div className="glass-panel attendance-card">
                  <h3 className="section-title">
                    <Clock size={18} color="var(--accent-green)" />
                    Today's Attendance Logs ({stats.logsToday})
                  </h3>
                  <div className="logs-list">
                    {attendanceLogs.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
                        No logs recorded today yet.
                      </p>
                    ) : (
                      attendanceLogs.map((log, idx) => (
                        <div key={idx} className="log-row">
                          <div className="log-info">
                            <span className="log-name">{log.name}</span>
                            <span className="log-id">{log.studentId} ({log.method || 'Auto-Scan'})</span>
                          </div>
                          <div className="log-time-meta">
                            <span className="log-time">{log.time}</span>
                            <span className="log-date">{log.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW: STUDENT PORTAL (DASHBOARD + LOGIN/REGISTER UNIFIED) ==================== */}
        {currentView === 'dashboard' && (
          <div>
            {!loggedInUser ? (
              <div className="glass-panel" style={{ padding: '32px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', textAlign: 'center' }}>
                    Student Portal
                  </h3>

                  {/* Sub-tabs: Login & Sign Up */}
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(124, 58, 237, 0.05)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setStudentSubTab('login');
                        setRegFaceDescriptor(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: studentSubTab === 'login' ? 'var(--primary)' : 'transparent',
                        color: studentSubTab === 'login' ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🔑 Sign In / Login
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setStudentSubTab('register');
                        setRegFaceDescriptor(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: studentSubTab === 'register' ? 'var(--primary)' : 'transparent',
                        color: studentSubTab === 'register' ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📝 New User (Sign Up)
                    </button>
                  </div>

                  {studentSubTab === 'login' ? (
                    /* --- SUB-TAB: STUDENT LOGIN --- */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="input-group">
                        <label htmlFor="portalStudentId">Student Roll No / ID</label>
                        <div className="search-input-wrapper">
                          <User size={15} className="search-icon" />
                          <input 
                            type="text" 
                            id="portalStudentId"
                            placeholder="Type Student ID or Search Name..."
                            value={loginIdInput}
                            onChange={(e) => setLoginIdInput(e.target.value)}
                            className="app-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStudentTextLogin(loginIdInput, loginPasswordInput);
                            }}
                          />
                        </div>
                        {loginSearchResults.length > 0 && (
                          <ul className="search-results">
                            {loginSearchResults.map(user => (
                              <li 
                                key={user.studentId} 
                                onClick={() => {
                                  setLoginIdInput(user.studentId);
                                  setLoginSearchResults([]);
                                }}
                                className="result-item"
                              >
                                <span>{user.name}</span>
                                <span className="result-item-id">{user.studentId}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="input-group">
                        <label htmlFor="portalStudentPassword">Password</label>
                        <input 
                          type="password" 
                          id="portalStudentPassword"
                          placeholder="Enter password..."
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                          className="app-input"
                          style={{ paddingLeft: '12px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStudentTextLogin(loginIdInput, loginPasswordInput);
                          }}
                        />
                      </div>

                      <button 
                        onClick={() => handleStudentTextLogin(loginIdInput, loginPasswordInput)}
                        className="app-btn btn-cyan"
                        style={{ width: '100%' }}
                        disabled={!loginIdInput.trim() || !loginPasswordInput.trim()}
                      >
                        <LogIn size={14} /> Login with ID & Password
                      </button>

                      <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                        —— OR USE FACE ID ——
                      </div>

                      <WebcamCapture 
                        mode="verify"
                        onFaceDetected={handleUnifiedFaceScan}
                        isProcessing={isProcessingFaceLogin}
                      />
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-6px' }}>
                        Position your face to automatically verify and login (registered users only).
                      </div>
                    </div>
                  ) : (
                    /* --- SUB-TAB: STUDENT REGISTER (SIGN UP) --- */
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                      <div className="input-group">
                        <label htmlFor="portalRegId">Roll No / Student ID</label>
                        <input 
                          type="text" 
                          id="portalRegId"
                          placeholder="e.g. S-2026-104"
                          value={regId}
                          onChange={(e) => setRegId(e.target.value)}
                          className="app-input"
                          style={{ paddingLeft: '12px' }}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="portalRegName">Student Full Name</label>
                        <input 
                          type="text" 
                          id="portalRegName"
                          placeholder="Enter full name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="app-input"
                          style={{ paddingLeft: '12px' }}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="portalRegPassword">Create Password</label>
                        <input 
                          type="password" 
                          id="portalRegPassword"
                          placeholder="Choose a password..."
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="app-input"
                          style={{ paddingLeft: '12px' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Scan Face ID
                        </label>
                        <WebcamCapture 
                          mode="register"
                          onFaceDetected={handleRegisterFace}
                          isProcessing={isRegistering}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="app-btn" 
                        disabled={isRegistering || !regFaceDescriptor || !regName.trim() || !regId.trim() || !regPassword.trim()}
                        style={{ width: '100%', marginTop: '12px' }}
                      >
                        {isRegistering ? 'Registering...' : regFaceDescriptor ? '✓ Register & Login' : 'Align Face to Register'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              // Active Dashboard Profile panel
              <div className="profile-container">
                {/* Profile Card */}
                <div className="glass-panel profile-card">
                  <div className="profile-avatar">
                    <User size={30} />
                  </div>
                  <h3 className="profile-name">{userProfile?.name || loggedInUser.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '-8px' }}>Active Library Member</p>

                  <div className="profile-meta-list">
                    <div className="profile-meta-item">
                      <span className="profile-meta-label">Student Roll ID</span>
                      <span className="profile-meta-val">{loggedInUser.studentId}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="profile-meta-label">Books Issued</span>
                      <span className="profile-meta-val">{userProfile?.issuedBooksCount || 0}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="profile-meta-label">Registered Since</span>
                      <span className="profile-meta-val">
                        {userProfile?.registeredAt ? userProfile.registeredAt.split(' ')[0] : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="app-btn btn-secondary"
                    style={{ width: '100%', marginTop: '12px', display: 'flex', gap: '8px', color: '#be123c', borderColor: '#fecdd3' }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>

                {/* Dashboard Details */}
                <div className="dashboard-details">
                  
                  {/* Issued Books */}
                  <div className="glass-panel dashboard-section">
                    <h3 className="section-title">
                      <BookOpen size={16} color="var(--primary)" />
                      My Currently Issued Books ({userProfile?.issuedBooks?.length || 0})
                    </h3>
                    
                    {!userProfile?.issuedBooks || userProfile.issuedBooks.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', padding: '10px 0', fontSize: '13px' }}>
                        You don't have any books issued at the moment.
                      </p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Book Title</th>
                              <th>Author</th>
                              <th>Due Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userProfile.issuedBooks.map(book => (
                              <tr key={book.id}>
                                <td>#{book.id}</td>
                                <td style={{ fontWeight: '700' }}>{book.title}</td>
                                <td>{book.author}</td>
                                <td style={{ color: 'var(--accent-red)', fontWeight: '700' }}>{book.dueDate}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                      onClick={() => setActiveReadingBook(book)}
                                      className="app-btn btn-cyan"
                                      style={{ padding: '6px 12px', fontSize: '11px' }}
                                    >
                                      Read Book
                                    </button>
                                    <button 
                                      onClick={() => handleReturnBook(book.id)}
                                      className="app-btn btn-secondary"
                                      style={{ padding: '6px 12px', fontSize: '11px', color: '#be123c', borderColor: '#fecdd3' }}
                                    >
                                      Return
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Requested Books */}
                  <div className="glass-panel dashboard-section">
                    <h3 className="section-title">
                      <Layers size={16} color="var(--secondary)" />
                      My Book Request History
                    </h3>
                    
                    {!userProfile?.requestedBooks || userProfile.requestedBooks.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', padding: '10px 0', fontSize: '13px' }}>
                        No book suggestions submitted.
                      </p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Book Information</th>
                              <th>Request Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userProfile.requestedBooks.map(order => (
                              <tr key={order.id}>
                                <td style={{ fontSize: '11px' }}>{order.date.split(' ')[0]}</td>
                                <td>
                                  <div style={{ fontWeight: '700' }}>{order.title}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>by {order.author}</div>
                                </td>
                                <td>
                                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Attendance History */}
                  <div className="glass-panel dashboard-section">
                    <h3 className="section-title">
                      <UserCheck size={16} color="var(--accent-green)" />
                      My Attendance Logs
                    </h3>
                    
                    {!userProfile?.attendanceHistory || userProfile.attendanceHistory.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', padding: '10px 0', fontSize: '13px' }}>
                        No attendance history found.
                      </p>
                    ) : (
                      <div className="books-table-wrapper">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Time Marked</th>
                              <th>Verification Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userProfile.attendanceHistory.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.date}</td>
                                <td>{item.time}</td>
                                <td>{item.method}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ==================== MODAL: REQUEST BOOK ==================== */}
      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Request Book Purchase</h3>
              <button className="modal-close" onClick={() => setIsOrderModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleOrderSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label htmlFor="ordTitle">Book Title</label>
                  <input 
                    type="text" 
                    id="ordTitle"
                    placeholder="e.g. Clean Code"
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '12px' }}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="ordAuthor">Author</label>
                  <input 
                    type="text" 
                    id="ordAuthor"
                    placeholder="e.g. Robert C. Martin"
                    value={orderAuthor}
                    onChange={(e) => setOrderAuthor(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '12px' }}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="ordReason">Reason for Suggestion</label>
                  <textarea 
                    id="ordReason"
                    placeholder="Briefly state why this book should be added..."
                    value={orderReason}
                    onChange={(e) => setOrderReason(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '12px', height: '70px', resize: 'none', paddingTop: '8px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="app-btn" style={{ flex: 1 }}>
                    Submit Suggestion
                  </button>
                  <button type="button" className="app-btn btn-secondary" onClick={() => setIsOrderModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ISSUE FORM (Replaces Face ID checkout) ==================== */}
      {isIssueModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Book Checkout</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setIsIssueModalOpen(false);
                  setIssuingBook(null);
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                You are issuing: <strong>"{issuingBook?.title}"</strong>. 
                Please select or enter your Student ID / Roll No to confirm checkout:
              </p>

              <div className="input-group" style={{ textAlign: 'left' }}>
                <label htmlFor="issueId">Student Roll No / ID</label>
                <div className="search-input-wrapper">
                  <User size={15} className="search-icon" />
                  <input 
                    type="text" 
                    id="issueId"
                    placeholder="Search name or type roll ID..."
                    value={issueIdInput}
                    onChange={(e) => setIssueIdInput(e.target.value)}
                    className="app-input"
                  />
                </div>

                {issueSearchResults.length > 0 && (
                  <ul className="search-results" style={{ marginTop: '4px' }}>
                    {issueSearchResults.map(user => (
                      <li 
                        key={user.studentId} 
                        onClick={() => handleIssueSubmit(user)}
                        className="result-item"
                      >
                        <span>{user.name}</span>
                        <span className="result-item-id">{user.studentId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => handleIssueSubmit(null)}
                  className="app-btn btn-cyan" 
                  style={{ flex: 1 }}
                  disabled={isProcessingIssue || !issueIdInput.trim()}
                >
                  {isProcessingIssue ? 'Checking out...' : 'Confirm Checkout'}
                </button>
                <button 
                  className="app-btn btn-secondary" 
                  onClick={() => {
                    setIsIssueModalOpen(false);
                    setIssuingBook(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Reader Modal */}
      {activeReadingBook && (
        <BookReader 
          book={activeReadingBook} 
          onClose={() => setActiveReadingBook(null)} 
        />
      )}

      {/* ==================== MODAL: ADMIN STUDENT DETAILS ==================== */}
      {selectedAdminStudent && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--primary-glow)', borderRadius: '50%', color: 'var(--primary)' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Student Profile Details</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {selectedAdminStudent.studentId}</span>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => {
                  setSelectedAdminStudent(null);
                  setAdminStudentProfile(null);
                }}
              >
                ×
              </button>
            </div>

            {isLoadingAdminProfile ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', animation: 'spin 1.5s infinite linear', color: 'var(--primary)' }} />
                <span>Loading student records...</span>
              </div>
            ) : adminStudentProfile ? (
              <div className="student-profile-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', textAlign: 'left' }}>
                {/* Left Side: Summary Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student Info</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adminStudentProfile.name}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Student Roll ID:</span>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adminStudentProfile.studentId}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Registered Since:</span>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adminStudentProfile.registeredAt || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
                    <div style={{ padding: '8px', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Check-ins</span>
                      <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>{adminStudentProfile.attendanceHistory?.length || 0}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Books Issued</span>
                      <strong style={{ fontSize: '18px', color: 'var(--accent-green)' }}>{adminStudentProfile.issuedBooks?.length || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Side: Detailed logs & records */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                  {/* Currently Issued Books */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      Currently Issued Books ({adminStudentProfile.issuedBooks?.length || 0})
                    </h4>
                    {!adminStudentProfile.issuedBooks || adminStudentProfile.issuedBooks.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No books currently checked out.</p>
                    ) : (
                      <ul style={{ paddingLeft: '20px', margin: '4px 0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {adminStudentProfile.issuedBooks.map(b => (
                          <li key={b.id}>
                            <strong>"{b.title}"</strong> by {b.author} <span style={{ color: 'var(--accent-red)', fontSize: '11px', fontWeight: 'bold' }}>(Due: {b.dueDate})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Suggestion History */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      Book Request History ({adminStudentProfile.requestedBooks?.length || 0})
                    </h4>
                    {!adminStudentProfile.requestedBooks || adminStudentProfile.requestedBooks.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No requests submitted.</p>
                    ) : (
                      <div className="books-table-wrapper" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        <table className="app-table" style={{ fontSize: '11px' }}>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Book Info</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminStudentProfile.requestedBooks.map(o => (
                              <tr key={o.id}>
                                <td>{o.date?.split(' ')[0]}</td>
                                <td><strong>{o.title}</strong><br/>{o.author}</td>
                                <td>
                                  <span className={`status-badge status-${o.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Attendance Log History */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      Detailed Attendance Logs ({adminStudentProfile.attendanceHistory?.length || 0})
                    </h4>
                    {!adminStudentProfile.attendanceHistory || adminStudentProfile.attendanceHistory.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No attendance logs recorded.</p>
                    ) : (
                      <div className="books-table-wrapper" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        <table className="app-table" style={{ fontSize: '11px' }}>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminStudentProfile.attendanceHistory.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.date}</td>
                                <td>{item.time}</td>
                                <td>{item.method}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Could not load profile details.</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        {isUsingMockDb && (
          <div style={{
            display: 'inline-block',
            margin: '0 auto 12px auto',
            background: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            color: 'var(--secondary)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            🔌 Running in Client-Side Offline Database Mode (Data saved to your browser)
          </div>
        )}
        <p>© 2026 Library Portal. Smart face-recognition features local via face-api.js.</p>
      </footer>
    </div>
  );
}

// Helper E-Book Reader component
function BookReader({ book, onClose }) {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [fontSize, setFontSize] = useState('md'); // 'sm', 'md', 'lg', 'xl'
  const [theme, setTheme] = useState('parchment'); // 'parchment', 'light', 'dark'

  // Fetch book reading content, fallback if not found
  const bookData = bookContents[book.id] || {
    title: book.title,
    author: book.author,
    chapters: [
      {
        title: "Introduction",
        pages: [
          `Welcome to "${book.title}" by ${book.author}. This is a digital copy issued to your library portal account.`,
          `This e-book is ready for offline reading. Start exploring the chapters and pages using the navigation controls.`
        ]
      }
    ]
  };

  const currentChapter = bookData.chapters[currentChapterIdx] || bookData.chapters[0];
  const currentPageText = currentChapter.pages[currentPageIdx] || currentChapter.pages[0];

  const handleNextPage = () => {
    if (currentPageIdx < currentChapter.pages.length - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
    } else if (currentChapterIdx < bookData.chapters.length - 1) {
      setCurrentChapterIdx(currentChapterIdx + 1);
      setCurrentPageIdx(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
    } else if (currentChapterIdx > 0) {
      setCurrentChapterIdx(currentChapterIdx - 1);
      const prevChapter = bookData.chapters[currentChapterIdx - 1];
      setCurrentPageIdx(prevChapter.pages.length - 1);
    }
  };

  return (
    <div className={`book-reader-overlay reader-theme-${theme}`}>
      {/* Reader Header */}
      <div className="book-reader-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onClose} className="reader-control-btn" style={{ fontSize: '13px', fontWeight: 'bold' }}>
            ← Close Reader
          </button>
          <div>
            <h3 style={{ fontSize: '15px', margin: 0, fontWeight: '700' }}>{bookData.title}</h3>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>by {bookData.author}</span>
          </div>
        </div>

        {/* Settings / Controls */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Font Size controls */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Font:</span>
            <button 
              type="button"
              onClick={() => setFontSize('sm')} 
              className={`reader-control-btn ${fontSize === 'sm' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              A-
            </button>
            <button 
              type="button"
              onClick={() => setFontSize('md')} 
              className={`reader-control-btn ${fontSize === 'md' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              A
            </button>
            <button 
              type="button"
              onClick={() => setFontSize('lg')} 
              className={`reader-control-btn ${fontSize === 'lg' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              A+
            </button>
            <button 
              type="button"
              onClick={() => setFontSize('xl')} 
              className={`reader-control-btn ${fontSize === 'xl' ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              A++
            </button>
          </div>

          {/* Theme selector */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Theme:</span>
            <button 
              type="button"
              onClick={() => setTheme('parchment')} 
              className={`reader-control-btn ${theme === 'parchment' ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              📜 Parchment
            </button>
            <button 
              type="button"
              onClick={() => setTheme('light')} 
              className={`reader-control-btn ${theme === 'light' ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              ☀️ Light
            </button>
            <button 
              type="button"
              onClick={() => setTheme('dark')} 
              className={`reader-control-btn ${theme === 'dark' ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      {/* Reader Body */}
      <div className="book-reader-body">
        {/* Sidebar: Table of Contents */}
        <div className="book-reader-sidebar">
          <h4>Table of Contents</h4>
          <ul className="chapter-list">
            {bookData.chapters.map((ch, idx) => (
              <li 
                key={idx}
                onClick={() => {
                  setCurrentChapterIdx(idx);
                  setCurrentPageIdx(0);
                }}
                className={`chapter-item ${currentChapterIdx === idx ? 'active' : ''}`}
              >
                {ch.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Reading Area */}
        <div className="book-reader-content-pane">
          <div className="book-reader-page">
            <div className="book-reader-title-line">
              {currentChapter.title}
            </div>

            <div className={`book-reader-body-text fs-${fontSize}`}>
              {currentPageText}
            </div>
          </div>

          {/* Footer with page number & next/prev buttons */}
          <div className="book-reader-footer">
            <button 
              type="button"
              onClick={handlePrevPage} 
              disabled={currentChapterIdx === 0 && currentPageIdx === 0}
              className="reader-control-btn"
            >
              ◀ Previous Page
            </button>

            <span>
              Page {currentPageIdx + 1} of {currentChapter.pages.length} (Chapter {currentChapterIdx + 1} of {bookData.chapters.length})
            </span>

            <button 
              type="button"
              onClick={handleNextPage} 
              disabled={currentChapterIdx === bookData.chapters.length - 1 && currentPageIdx === currentChapter.pages.length - 1}
              className="reader-control-btn"
            >
              Next Page ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
