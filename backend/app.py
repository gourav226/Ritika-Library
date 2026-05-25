import os
import json
import math
from datetime import datetime, timedelta
from threading import Lock
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for the React frontend

DB_FILE = os.path.join(os.path.dirname(__file__), 'database.json')
db_lock = Lock()

def load_db():
    with db_lock:
        if not os.path.exists(DB_FILE):
            # Fallback seed if database.json was deleted
            return {"books": [], "users": [], "attendance": [], "orders": []}
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading database: {e}")
            return {"books": [], "users": [], "attendance": [], "orders": []}

def save_db(data):
    with db_lock:
        try:
            with open(DB_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error writing database: {e}")
            return False

def euclidean_distance(desc1, desc2):
    """Calculate Euclidean distance between two 128-dimensional face descriptors."""
    if not desc1 or not desc2 or len(desc1) != len(desc2):
        return 999.0
    return math.sqrt(sum((float(x) - float(y)) ** 2 for x, y in zip(desc1, desc2)))

# ==================== BOOK APIS ====================

@app.route('/api/books', methods=['GET'])
def get_books():
    db = load_db()
    return jsonify(db.get('books', []))

@app.route('/api/books/issue', methods=['POST'])
def issue_book():
    data = request.json
    book_id = data.get('bookId')
    student_id = data.get('studentId')
    student_name = data.get('studentName')
    
    if not book_id or not student_id or not student_name:
        return jsonify({"error": "Missing parameters (bookId, studentId, studentName required)"}), 400
        
    db = load_db()
    books = db.get('books', [])
    users = db.get('users', [])
    
    # Verify student exists
    student_exists = any(u['studentId'] == student_id for u in users)
    if not student_exists:
        return jsonify({"error": "Student is not registered in the system"}), 404
        
    # Find and update book
    book_found = False
    for book in books:
        if book['id'] == int(book_id):
            book_found = True
            if not book['available']:
                return jsonify({"error": f"Book is already issued to {book.get('issuedName', 'someone else')}"}), 400
            
            due_date = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
            book['available'] = False
            book['issuedTo'] = student_id
            book['issuedName'] = student_name
            book['dueDate'] = due_date
            break
            
    if not book_found:
        return jsonify({"error": "Book not found"}), 404
        
    save_db(db)
    return jsonify({"success": True, "message": "Book issued successfully", "dueDate": due_date})

@app.route('/api/books/return', methods=['POST'])
def return_book():
    data = request.json
    book_id = data.get('bookId')
    
    if not book_id:
        return jsonify({"error": "Missing bookId"}), 400
        
    db = load_db()
    books = db.get('books', [])
    
    book_found = False
    for book in books:
        if book['id'] == int(book_id):
            book_found = True
            if book['available']:
                return jsonify({"error": "Book is already available in the library"}), 400
            
            book['available'] = True
            book['issuedTo'] = None
            book['issuedName'] = None
            book['dueDate'] = None
            break
            
    if not book_found:
        return jsonify({"error": "Book not found"}), 404
        
    save_db(db)
    return jsonify({"success": True, "message": "Book returned successfully"})

@app.route('/api/books/order', methods=['POST'])
def order_book():
    data = request.json
    title = data.get('title')
    author = data.get('author')
    requested_by = data.get('requestedBy')
    reason = data.get('reason', '')
    
    if not title or not author or not requested_by:
        return jsonify({"error": "Missing book title, author, or student name"}), 400
        
    db = load_db()
    orders = db.get('orders', [])
    
    new_order = {
        "id": len(orders) + 1,
        "title": title,
        "author": author,
        "requestedBy": requested_by,
        "reason": reason,
        "status": "Pending",
        "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    orders.append(new_order)
    db['orders'] = orders
    save_db(db)
    
    return jsonify({"success": True, "message": "Book requested successfully", "order": new_order})


# ==================== USER REGISTRATION ====================

@app.route('/api/users', methods=['GET'])
def get_users():
    db = load_db()
    # Filter out faceDescriptor to make API response lightweight
    light_users = []
    for u in db.get('users', []):
        light_users.append({
            "studentId": u['studentId'],
            "name": u['name'],
            "registeredAt": u.get('registeredAt', '')
        })
    return jsonify(light_users)

@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.json
    student_id = data.get('studentId')
    name = data.get('name')
    face_descriptor = data.get('faceDescriptor') # list of 128 floats
    
    if not student_id or not name or not face_descriptor:
        return jsonify({"error": "Missing studentId, name, or faceDescriptor"}), 400
        
    if len(face_descriptor) != 128:
        return jsonify({"error": "Face descriptor must contain exactly 128 numerical values"}), 400
        
    db = load_db()
    users = db.get('users', [])
    
    # Check if user already exists
    for user in users:
        if user['studentId'] == student_id:
            # Overwrite face id if user wants to re-register
            user['name'] = name
            user['faceDescriptor'] = face_descriptor
            user['registeredAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            save_db(db)
            return jsonify({"success": True, "message": "Face ID updated successfully"})
            
    # Add new user
    new_user = {
        "studentId": student_id,
        "name": name,
        "faceDescriptor": face_descriptor,
        "registeredAt": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    users.append(new_user)
    db['users'] = users
    save_db(db)
    
    return jsonify({"success": True, "message": "Student registered with Face ID successfully"})


# ==================== FACE ID ATTENDANCE ====================

@app.route('/api/attendance/mark', methods=['POST'])
def mark_attendance():
    data = request.json
    face_descriptor = data.get('faceDescriptor')
    student_id = data.get('studentId') # Optional: if user searched their name first
    
    if not face_descriptor:
        return jsonify({"error": "Missing faceDescriptor"}), 400
        
    db = load_db()
    users = db.get('users', [])
    
    if not users:
        return jsonify({"error": "No students are registered in the database yet"}), 404
        
    matched_user = None
    min_distance = 999.0
    threshold = 0.60  # 0.60 is the standard recommended threshold for face-api.js matching
    
    if student_id:
        # Scenario B: User searched by name/id first, now verifying face
        target_user = None
        for user in users:
            if user['studentId'] == student_id:
                target_user = user
                break
        
        if not target_user:
            return jsonify({"error": "Student not found"}), 404
            
        dist = euclidean_distance(face_descriptor, target_user['faceDescriptor'])
        if dist < threshold:
            matched_user = target_user
            min_distance = dist
        else:
            return jsonify({"error": "Face verification failed. Face does not match the record."}), 400
    else:
        # Scenario A: Auto face recognition scanner
        for user in users:
            dist = euclidean_distance(face_descriptor, user['faceDescriptor'])
            if dist < min_distance:
                min_distance = dist
                matched_user = user
                
        if min_distance > threshold or not matched_user:
            return jsonify({"error": "Face not recognized. Please register first or adjust lighting."}), 400
            
    # Mark attendance for today
    today_str = datetime.now().strftime('%Y-%m-%d')
    now_time_str = datetime.now().strftime('%H:%M:%S')
    
    attendance = db.get('attendance', [])
    
    # Check if already marked for today
    already_marked = any(log['studentId'] == matched_user['studentId'] and log['date'] == today_str for log in attendance)
    
    method = "Face Verify" if student_id else "Auto-Scan"
    
    if already_marked:
        return jsonify({
            "success": True, 
            "alreadyMarked": True,
            "message": f"Attendance already marked for today", 
            "studentName": matched_user['name'],
            "studentId": matched_user['studentId']
        })
        
    new_log = {
        "studentId": matched_user['studentId'],
        "name": matched_user['name'],
        "date": today_str,
        "time": now_time_str,
        "method": method
    }
    
    attendance.append(new_log)
    db['attendance'] = attendance
    save_db(db)
    
    return jsonify({
        "success": True,
        "message": f"Attendance marked for {matched_user['name']}",
        "studentName": matched_user['name'],
        "studentId": matched_user['studentId'],
        "time": now_time_str,
        "distance": round(min_distance, 4)
    })

@app.route('/api/attendance/logs', methods=['GET'])
def get_attendance_logs():
    db = load_db()
    logs = db.get('attendance', [])
    # Return logs reversed (newest first)
    return jsonify(list(reversed(logs)))


# ==================== PROFILE DASHBOARD ====================

@app.route('/api/users/profile/<student_id>', methods=['GET'])
def get_user_profile(student_id):
    db = load_db()
    users = db.get('users', [])
    
    # Find user
    user = None
    for u in users:
        if u['studentId'] == student_id:
            user = u
            break
            
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Get issued books
    books = db.get('books', [])
    issued_books = [
        {
            "id": b['id'],
            "title": b['title'],
            "author": b['author'],
            "genre": b['genre'],
            "dueDate": b['dueDate']
        } for b in books if b.get('issuedTo') == student_id
    ]
    
    # Get requested books
    orders = db.get('orders', [])
    requested_books = [
        {
            "id": o['id'],
            "title": o['title'],
            "author": o['author'],
            "status": o['status'],
            "date": o['date']
        } for o in orders if o.get('requestedBy') == user['name'] or o.get('requestedBy') == student_id
    ]
    
    # Get attendance history
    attendance = db.get('attendance', [])
    user_attendance = [
        {
            "date": a['date'],
            "time": a['time'],
            "method": a['method']
        } for a in attendance if a['studentId'] == student_id
    ]
    
    return jsonify({
        "studentId": user['studentId'],
        "name": user['name'],
        "registeredAt": user.get('registeredAt', ''),
        "issuedBooksCount": len(issued_books),
        "issuedBooks": issued_books,
        "requestedBooks": requested_books,
        "attendanceHistory": list(reversed(user_attendance))
    })

# Verify Face Login (checks descriptor similarity to authenticate user for dashboard)
@app.route('/api/users/login', methods=['POST'])
def login_user():
    data = request.json
    face_descriptor = data.get('faceDescriptor')
    
    if not face_descriptor:
        return jsonify({"error": "Missing faceDescriptor"}), 400
        
    db = load_db()
    users = db.get('users', [])
    
    if not users:
        return jsonify({"error": "No students registered yet"}), 404
        
    matched_user = None
    min_distance = 999.0
    threshold = 0.60
    
    for user in users:
        dist = euclidean_distance(face_descriptor, user['faceDescriptor'])
        if dist < min_distance:
            min_distance = dist
            matched_user = user
            
    if min_distance > threshold or not matched_user:
        return jsonify({"error": "Face not recognized. Access Denied."}), 401
        
    return jsonify({
        "success": True,
        "studentId": matched_user['studentId'],
        "name": matched_user['name']
    })

if __name__ == '__main__':
    # Start on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
