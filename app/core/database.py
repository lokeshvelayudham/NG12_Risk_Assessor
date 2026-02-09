import sqlite3
import datetime

DB_NAME = "chat_history.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def add_message(session_id: str, role: str, content: str):
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)',
        (session_id, role, content)
    )
    conn.commit()
    conn.close()

def get_chat_history(session_id: str, limit: int = 5):
    conn = get_db_connection()
    cursor = conn.execute(
        'SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC',
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append(f"{row['role'].capitalize()}: {row['content']}")
        
    return history

def get_all_sessions():
    """Returns a list of unique session_ids with their latest timestamp."""
    conn = get_db_connection()
    cursor = conn.execute('''
        SELECT session_id, MAX(timestamp) as last_active 
        FROM chat_history 
        GROUP BY session_id 
        ORDER BY last_active DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    sessions = []
    for row in rows:
        sessions.append({
            "session_id": row["session_id"],
            "last_active": row["last_active"]
        })
    return sessions

def clear_chat_history(session_id: str):
    conn = get_db_connection()
    conn.execute('DELETE FROM chat_history WHERE session_id = ?', (session_id,))
    conn.commit()
    conn.close()
