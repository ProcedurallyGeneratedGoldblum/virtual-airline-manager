const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'vam.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
const initSQL = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
db.exec(initSQL);

console.log('Database initialized at:', dbPath);

// ============================================================================
// COMPANY ENDPOINTS
// ============================================================================

// Get company data
app.get('/api/company', (req, res) => {
    try {
        const company = db.prepare('SELECT * FROM company WHERE id = 1').get();
        res.json(company || {});
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ error: 'Failed to fetch company data' });
    }
});

// Update company data
app.put('/api/company', (req, res) => {
    try {
        const {
            name, callsign, founded, headquarters, description, motto,
            focus_area, pilots, aircraft, total_flights, total_earnings,
            flight_hours, balance, established
        } = req.body;

        const stmt = db.prepare(`
      UPDATE company SET
        name = ?, callsign = ?, founded = ?, headquarters = ?,
        description = ?, motto = ?, focus_area = ?, pilots = ?,
        aircraft = ?, total_flights = ?, total_earnings = ?,
        flight_hours = ?, balance = ?, established = ?
      WHERE id = 1
    `);

        stmt.run(
            name, callsign, founded, headquarters, description, motto,
            focus_area, pilots, aircraft, total_flights, total_earnings,
            flight_hours, balance, established
        );

        const updated = db.prepare('SELECT * FROM company WHERE id = 1').get();
        res.json(updated);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ error: 'Failed to update company data' });
    }
});

// ============================================================================
// PILOT ENDPOINTS
// ============================================================================

// Get pilot data
app.get('/api/pilot', (req, res) => {
    try {
        const pilot = db.prepare('SELECT * FROM pilot WHERE id = 1').get();
        res.json(pilot || {});
    } catch (error) {
        console.error('Error fetching pilot:', error);
        res.status(500).json({ error: 'Failed to fetch pilot data' });
    }
});

// Update pilot data
app.put('/api/pilot', (req, res) => {
    try {
        const {
            name, callsign, rank, role, license, join_date,
            total_flights, total_hours, total_distance, total_earnings,
            rating, on_time_percentage, safety_rating, experience, next_rank_xp
        } = req.body;

        const stmt = db.prepare(`
      UPDATE pilot SET
        name = ?, callsign = ?, rank = ?, role = ?, license = ?,
        join_date = ?, total_flights = ?, total_hours = ?,
        total_distance = ?, total_earnings = ?, rating = ?,
        on_time_percentage = ?, safety_rating = ?, experience = ?,
        next_rank_xp = ?
      WHERE id = 1
    `);

        stmt.run(
            name, callsign, rank, role, license, join_date,
            total_flights, total_hours, total_distance, total_earnings,
            rating, on_time_percentage, safety_rating, experience, next_rank_xp
        );

        const updated = db.prepare('SELECT * FROM pilot WHERE id = 1').get();
        res.json(updated);
    } catch (error) {
        console.error('Error updating pilot:', error);
        res.status(500).json({ error: 'Failed to update pilot data' });
    }
});

// ============================================================================
// FLEET ENDPOINTS
// ============================================================================

// Get all fleet aircraft
app.get('/api/fleet', (req, res) => {
    try {
        const fleet = db.prepare('SELECT * FROM fleet ORDER BY id').all();

        // Parse JSON fields
        const parsedFleet = fleet.map(aircraft => ({
            ...aircraft,
            condition_details: aircraft.condition_details ? JSON.parse(aircraft.condition_details) : null,
            mel_list: aircraft.mel_list ? JSON.parse(aircraft.mel_list) : [],
            specs: aircraft.specs ? JSON.parse(aircraft.specs) : null
        }));

        res.json(parsedFleet);
    } catch (error) {
        console.error('Error fetching fleet:', error);
        res.status(500).json({ error: 'Failed to fetch fleet data' });
    }
});

// Add aircraft to fleet
app.post('/api/fleet', (req, res) => {
    try {
        const {
            registration, type, status, location, total_hours,
            hours_since_inspection, next_inspection_due, last_flight,
            condition, condition_details, mel_list, maintenance_notes,
            locked_by, current_flight, name, manufacturer, year, price, specs
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO fleet (
        registration, type, status, location, total_hours,
        hours_since_inspection, next_inspection_due, last_flight,
        condition, condition_details, mel_list, maintenance_notes,
        locked_by, current_flight, name, manufacturer, year, price, specs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            registration, type, status, location, total_hours,
            hours_since_inspection, next_inspection_due, last_flight,
            condition,
            condition_details ? JSON.stringify(condition_details) : null,
            mel_list ? JSON.stringify(mel_list) : null,
            maintenance_notes, locked_by, current_flight,
            name, manufacturer, year, price,
            specs ? JSON.stringify(specs) : null
        );

        const newAircraft = db.prepare('SELECT * FROM fleet WHERE id = ?').get(result.lastInsertRowid);
        res.json({
            ...newAircraft,
            condition_details: newAircraft.condition_details ? JSON.parse(newAircraft.condition_details) : null,
            mel_list: newAircraft.mel_list ? JSON.parse(newAircraft.mel_list) : [],
            specs: newAircraft.specs ? JSON.parse(newAircraft.specs) : null
        });
    } catch (error) {
        console.error('Error adding aircraft:', error);
        res.status(500).json({ error: 'Failed to add aircraft' });
    }
});

// Update aircraft
app.put('/api/fleet/:id', (req, res) => {
    try {
        const { id } = req.params;
        const {
            registration, type, status, location, total_hours,
            hours_since_inspection, next_inspection_due, last_flight,
            condition, condition_details, mel_list, maintenance_notes,
            locked_by, current_flight, name, manufacturer, year, price, specs
        } = req.body;

        const stmt = db.prepare(`
      UPDATE fleet SET
        registration = ?, type = ?, status = ?, location = ?,
        total_hours = ?, hours_since_inspection = ?,
        next_inspection_due = ?, last_flight = ?, condition = ?,
        condition_details = ?, mel_list = ?, maintenance_notes = ?,
        locked_by = ?, current_flight = ?, name = ?, manufacturer = ?,
        year = ?, price = ?, specs = ?
      WHERE id = ?
    `);

        stmt.run(
            registration, type, status, location, total_hours,
            hours_since_inspection, next_inspection_due, last_flight,
            condition,
            condition_details ? JSON.stringify(condition_details) : null,
            mel_list ? JSON.stringify(mel_list) : null,
            maintenance_notes, locked_by, current_flight,
            name, manufacturer, year, price,
            specs ? JSON.stringify(specs) : null,
            id
        );

        const updated = db.prepare('SELECT * FROM fleet WHERE id = ?').get(id);
        res.json({
            ...updated,
            condition_details: updated.condition_details ? JSON.parse(updated.condition_details) : null,
            mel_list: updated.mel_list ? JSON.parse(updated.mel_list) : [],
            specs: updated.specs ? JSON.parse(updated.specs) : null
        });
    } catch (error) {
        console.error('Error updating aircraft:', error);
        res.status(500).json({ error: 'Failed to update aircraft' });
    }
});

// Delete aircraft
app.delete('/api/fleet/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM fleet WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting aircraft:', error);
        res.status(500).json({ error: 'Failed to delete aircraft' });
    }
});

// ============================================================================
// ACTIVE FLIGHTS ENDPOINTS
// ============================================================================

// Get all active flights
app.get('/api/flights/active', (req, res) => {
    try {
        const flights = db.prepare('SELECT * FROM active_flights').all();

        // Transform to match frontend format
        const transformed = flights.map(flight => ({
            id: flight.id,
            flightNumber: flight.flight_number,
            aircraft: flight.aircraft,
            aircraftId: flight.aircraft_id,
            aircraftRegistration: flight.aircraft_registration,
            status: flight.status,
            priority: flight.priority,
            route: {
                from: flight.route_from,
                fromCode: flight.route_from_code,
                to: flight.route_to,
                toCode: flight.route_to_code
            },
            duration: flight.duration,
            distance: flight.distance,
            cargo: {
                type: flight.cargo_type,
                passengers: flight.cargo_passengers
            },
            weather: flight.weather,
            notes: flight.notes,
            acceptedAt: flight.accepted_at
        }));

        res.json(transformed);
    } catch (error) {
        console.error('Error fetching active flights:', error);
        res.status(500).json({ error: 'Failed to fetch active flights' });
    }
});

// Add active flight
app.post('/api/flights/active', (req, res) => {
    try {
        const {
            id, flightNumber, aircraft, aircraftId, aircraftRegistration,
            status, priority, route, duration, distance, cargo, weather, notes, acceptedAt
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO active_flights (
        id, flight_number, aircraft, aircraft_id, aircraft_registration,
        status, priority, route_from, route_from_code, route_to, route_to_code,
        duration, distance, cargo_type, cargo_passengers, weather, notes, accepted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id, flightNumber, aircraft, aircraftId, aircraftRegistration,
            status, priority, route.from, route.fromCode, route.to, route.toCode,
            duration, distance, cargo.type, cargo.passengers, weather, notes, acceptedAt
        );

        res.json({ success: true, id });
    } catch (error) {
        console.error('Error adding active flight:', error);
        res.status(500).json({ error: 'Failed to add active flight' });
    }
});

// Delete active flight
app.delete('/api/flights/active/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM active_flights WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting active flight:', error);
        res.status(500).json({ error: 'Failed to delete active flight' });
    }
});

// ============================================================================
// COMPLETED FLIGHTS ENDPOINTS
// ============================================================================

// Get all completed flights
app.get('/api/flights/completed', (req, res) => {
    try {
        const flights = db.prepare('SELECT * FROM completed_flights ORDER BY id DESC').all();

        // Parse briefing JSON
        const parsed = flights.map(flight => ({
            ...flight,
            briefing: flight.briefing ? JSON.parse(flight.briefing) : null
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Error fetching completed flights:', error);
        res.status(500).json({ error: 'Failed to fetch completed flights' });
    }
});

// Add completed flight
app.post('/api/flights/completed', (req, res) => {
    try {
        const {
            flight_id, flight_number, route, aircraft, type,
            date, duration, distance, earnings, status, briefing
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO completed_flights (
        flight_id, flight_number, route, aircraft, type,
        date, duration, distance, earnings, status, briefing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            flight_id, flight_number, route, aircraft, type,
            date, duration, distance, earnings, status,
            briefing ? JSON.stringify(briefing) : null
        );

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Error adding completed flight:', error);
        res.status(500).json({ error: 'Failed to add completed flight' });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`VAM Backend API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing database connection...');
    db.close();
    process.exit(0);
});
