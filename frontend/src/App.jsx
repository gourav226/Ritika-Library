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
  
  // App States
  const [books, setBooks] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, activeStudents: 0, logsToday: 0 });
  
  // Dashboard states
  const [loggedInUser, setLoggedInUser] = useState(null); // { studentId, name }
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
    if (loggedInUser) {
      fetchUserProfile(loggedInUser.studentId);
    } else {
      setUserProfile(null);
    }
  }, [loggedInUser]);

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

  const handleTextLoginSubmit = async (studentId) => {
    if (!studentId.trim()) {
      addToast('Please enter your Student ID', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/profile/${studentId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setLoggedInUser({ studentId: data.studentId, name: data.name });
        addToast(`Access Granted. Welcome back, ${data.name}!`, 'success');
        setLoginIdInput('');
        setLoginSearchResults([]);
      } else {
        addToast('Student ID not found. Please register under "Register Face ID" first.', 'error');
      }
    } catch (err) {
      // Local fallback
      const localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const user = localUsers.find(u => u.studentId.toLowerCase() === studentId.trim().toLowerCase());
      if (user) {
        setLoggedInUser({ studentId: user.studentId, name: user.name });
        addToast(`Access Granted. Welcome back, ${user.name}!`, 'success');
        setLoginIdInput('');
        setLoginSearchResults([]);
      } else {
        addToast('Student ID not found in local database. Please register first.', 'error');
      }
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
    e.preventDefault();
    if (!regName.trim() || !regId.trim()) {
      addToast('Please enter both Name and Student ID', 'error');
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
          studentId: regId.trim(),
          name: regName.trim(),
          faceDescriptor: regFaceDescriptor
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Registration Successful!', 'success');
        fetchUsers();
        
        // Auto Log In
        setLoggedInUser({ studentId: regId.trim(), name: regName.trim() });
        addToast(`Welcome to your dashboard, ${regName}!`, 'success');

        // Reset fields
        setRegName('');
        setRegId('');
        setRegFaceDescriptor(null);
      } else {
        addToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      // Local fallback
      let localUsers = JSON.parse(localStorage.getItem('ritika_library_users') || JSON.stringify(DEFAULT_USERS));
      const existingUserIdx = localUsers.findIndex(u => u.studentId.toLowerCase() === regId.trim().toLowerCase());
      
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (existingUserIdx !== -1) {
        localUsers[existingUserIdx].name = regName.trim();
        localUsers[existingUserIdx].faceDescriptor = regFaceDescriptor;
        localUsers[existingUserIdx].registeredAt = timestamp;
        addToast('Face ID updated successfully in local database!', 'success');
      } else {
        const newUser = {
          studentId: regId.trim(),
          name: regName.trim(),
          faceDescriptor: regFaceDescriptor,
          registeredAt: timestamp
        };
        localUsers.push(newUser);
        addToast('Student registered with Face ID successfully in local database!', 'success');
      }

      localStorage.setItem('ritika_library_users', JSON.stringify(localUsers));
      fetchUsers();

      // Auto Log In
      setLoggedInUser({ studentId: regId.trim(), name: regName.trim() });
      addToast(`Welcome to your dashboard, ${regName}!`, 'success');

      // Reset fields
      setRegName('');
      setRegId('');
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

      {/* Navigation Header */}
      <header className="app-header">
        <nav className="nav-container">
          <a href="#" className="brand" onClick={() => setCurrentView('home')}>
            <div className="brand-icon">
              <BookOpen size={20} color="#fff" />
            </div>
            <span className="brand-text">Ritika Library</span>
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

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* ==================== VIEW: HOME (E-COMMERCE STYLE SHOWCASE) ==================== */}
        {currentView === 'home' && (
          <div>
            {/* Hero Welcome banner */}
            <div className="homepage-hero">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1>Ritika Library Showcase</h1>
                  <p>
                    Browse and check out real-world books across programming, science, self-help, fiction, and fantasy. Instant book issuing powered by Face ID.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setIsOrderModalOpen(true)} className="app-btn">
                    <Plus size={15} /> Order New Book
                  </button>
                  <button onClick={() => setCurrentView('attendance')} className="app-btn btn-secondary">
                    <Camera size={15} /> Scan Attendance
                  </button>
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
              // Side-by-side Unified Portal Login & Register
              <div className="portal-auth-container">
                {/* Left Card: Login */}
                <div className="portal-auth-card glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h2 className="section-title" style={{ justifyContent: 'center' }}>
                      <LogIn size={18} color="var(--primary)" />
                      Student Login
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>
                      Enter your Student ID / Roll No to access your dashboard.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '24px' }}>
                      <div className="input-group">
                        <label htmlFor="loginId">Student Roll No / ID</label>
                        <div className="search-input-wrapper">
                          <User size={15} className="search-icon" />
                          <input 
                            type="text" 
                            id="loginId"
                            placeholder="Type Student ID or Search Name..."
                            value={loginIdInput}
                            onChange={(e) => setLoginIdInput(e.target.value)}
                            className="app-input"
                          />
                        </div>

                        {loginSearchResults.length > 0 && (
                          <ul className="search-results" style={{ marginTop: '4px' }}>
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
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTextLoginSubmit(loginIdInput)}
                    className="app-btn btn-cyan"
                    style={{ width: '100%', marginTop: 'auto' }}
                    disabled={!loginIdInput.trim()}
                  >
                    <LogIn size={14} /> Access Dashboard
                  </button>
                </div>

                {/* Right Card: Register Face ID */}
                <div className="portal-auth-card glass-panel">
                  <h2 className="section-title">
                    <UserPlus size={18} color="var(--primary)" />
                    Register Face ID Profile
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                    Register once. Position your face in front of the camera, enter your name/roll no, and save to register.
                  </p>

                  <form onSubmit={handleRegisterSubmit}>
                    <div className="register-card-layout">
                      {/* Left Column: Camera Scanner */}
                      <div className="register-camera-wrapper" style={{ margin: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                          Camera Scanner (Hold still when face is aligned)
                        </label>
                        <WebcamCapture 
                          mode="register"
                          onFaceDetected={handleRegisterFace}
                          isProcessing={false}
                        />
                      </div>

                      {/* Right Column: Text inputs and Submit action */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', height: '100%' }}>
                        <div className="input-group flex-1">
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
                        
                        <div className="input-group flex-1">
                          <label htmlFor="regId">Student Roll No / ID</label>
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                          <button 
                            type="submit" 
                            className="app-btn" 
                            disabled={isRegistering || !regFaceDescriptor}
                            style={{ width: '100%' }}
                          >
                            {isRegistering ? 'Registering...' : 'Save Profile & Face ID'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
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
                    onClick={() => {
                      setLoggedInUser(null);
                      setUserProfile(null);
                      addToast('Logged out successfully', 'info');
                    }}
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
        <p>© 2026 Ritika Library Portal. Smart face-recognition features local via face-api.js.</p>
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
