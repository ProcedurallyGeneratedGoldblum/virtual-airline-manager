-- Company table
CREATE TABLE IF NOT EXISTS company (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  callsign TEXT,
  founded TEXT,
  headquarters TEXT,
  description TEXT,
  motto TEXT,
  focus_area TEXT DEFAULT 'bush',
  pilots INTEGER DEFAULT 1,
  aircraft INTEGER DEFAULT 3,
  total_flights INTEGER DEFAULT 0,
  total_earnings REAL DEFAULT 0,
  flight_hours REAL DEFAULT 0,
  balance REAL DEFAULT 5000000,
  established TEXT NOT NULL
);

-- Pilot table
CREATE TABLE IF NOT EXISTS pilot (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  callsign TEXT,
  rank TEXT DEFAULT 'Junior Pilot',
  role TEXT DEFAULT 'Company Owner',
  license TEXT,
  join_date TEXT NOT NULL,
  total_flights INTEGER DEFAULT 0,
  total_hours REAL DEFAULT 0,
  total_distance REAL DEFAULT 0,
  total_earnings REAL DEFAULT 0,
  rating REAL DEFAULT 0,
  on_time_percentage INTEGER DEFAULT 0,
  safety_rating INTEGER DEFAULT 100,
  experience INTEGER DEFAULT 0,
  next_rank_xp INTEGER DEFAULT 1000
);

-- Fleet table
CREATE TABLE IF NOT EXISTS fleet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  location TEXT NOT NULL,
  total_hours REAL DEFAULT 0,
  hours_since_inspection REAL DEFAULT 0,
  next_inspection_due REAL DEFAULT 100,
  last_flight TEXT,
  condition TEXT DEFAULT 'good',
  condition_details TEXT,
  mel_list TEXT,
  maintenance_notes TEXT,
  locked_by TEXT,
  current_flight TEXT,
  name TEXT,
  manufacturer TEXT,
  year INTEGER,
  price REAL,
  specs TEXT
);

-- Active flights table
CREATE TABLE IF NOT EXISTS active_flights (
  id TEXT PRIMARY KEY,
  flight_number TEXT NOT NULL,
  aircraft TEXT NOT NULL,
  aircraft_id INTEGER NOT NULL,
  aircraft_registration TEXT NOT NULL,
  status TEXT DEFAULT 'in-progress',
  priority TEXT,
  route_from TEXT NOT NULL,
  route_from_code TEXT NOT NULL,
  route_to TEXT NOT NULL,
  route_to_code TEXT NOT NULL,
  duration TEXT,
  distance REAL,
  cargo_type TEXT,
  cargo_passengers INTEGER,
  weather TEXT,
  notes TEXT,
  accepted_at TEXT NOT NULL,
  FOREIGN KEY (aircraft_id) REFERENCES fleet(id)
);

-- Completed flights table
CREATE TABLE IF NOT EXISTS completed_flights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  route TEXT NOT NULL,
  aircraft TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  duration TEXT NOT NULL,
  distance REAL,
  earnings REAL DEFAULT 0,
  status TEXT DEFAULT 'completed',
  briefing TEXT
);

-- Insert default company if not exists
INSERT OR IGNORE INTO company (id, name, callsign, founded, headquarters, description, motto, focus_area, pilots, aircraft, total_flights, total_earnings, flight_hours, balance, established)
VALUES (1, '', '', '', '', '', '', 'bush', 1, 0, 0, 0, 0, 5000000, date('now'));

-- Insert default pilot if not exists
INSERT OR IGNORE INTO pilot (id, name, callsign, rank, role, license, join_date, total_flights, total_hours, total_distance, total_earnings, rating, on_time_percentage, safety_rating, experience, next_rank_xp)
VALUES (1, '', '', 'Junior Pilot', 'Company Owner', '', date('now'), 0, 0, 0, 0, 0, 0, 100, 0, 1000);
