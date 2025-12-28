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

// --- DYNAMIC SCHEMA MIGRATION ---
// Ensure new columns exist in the fleet table if the DB was created earlier
try {
    const columns = db.prepare('PRAGMA table_info(fleet)').all();
    const columnNames = columns.map(c => c.name);

    const logisticsColumns = [
        { name: 'fuel_level', type: 'REAL', default: '100' },
        { name: 'fuel_capacity', type: 'REAL', default: '100' },
        { name: 'fuel_type', type: 'TEXT', default: '"AVGAS"' },
        { name: 'payload_capacity', type: 'REAL', default: '0' },
        { name: 'oil_condition', type: 'REAL', default: '100' },
        { name: 'tire_condition', type: 'REAL', default: '100' },
        { name: 'engine_condition', type: 'REAL', default: '100' },
        { name: 'hours_at_last_a', type: 'REAL', default: '0' },
        { name: 'hours_at_last_b', type: 'REAL', default: '0' },
        { name: 'hours_at_last_c', type: 'REAL', default: '0' },
        { name: 'hours_at_last_d', type: 'REAL', default: '0' }
    ];

    logisticsColumns.forEach(col => {
        if (!columnNames.includes(col.name)) {
            db.prepare(`ALTER TABLE fleet ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`).run();
            console.log(`Migrated fleet table with ${col.name} column.`);
        }
    });
} catch (err) {
    console.error('Migration failed:', err.message);
}

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
            locked_by, current_flight, name, manufacturer, year, price, specs,
            fuel_level, fuel_capacity, fuel_type, payload_capacity,
            oil_condition, tire_condition, engine_condition,
            hours_at_last_a, hours_at_last_b, hours_at_last_c, hours_at_last_d
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO fleet (
        registration, type, status, location, total_hours,
        hours_since_inspection, next_inspection_due, last_flight,
        condition, condition_details, mel_list, maintenance_notes,
        locked_by, current_flight, name, manufacturer, year, price, specs,
        fuel_level, fuel_capacity, fuel_type, payload_capacity,
        oil_condition, tire_condition, engine_condition,
        hours_at_last_a, hours_at_last_b, hours_at_last_c, hours_at_last_d
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            registration, type, status, location, total_hours,
            hours_since_inspection, next_inspection_due, last_flight,
            condition,
            condition_details ? JSON.stringify(condition_details) : null,
            mel_list ? JSON.stringify(mel_list) : null,
            maintenance_notes, locked_by, current_flight,
            name, manufacturer, year, price,
            specs ? JSON.stringify(specs) : null,
            fuel_level ?? 100,
            fuel_capacity ?? 100,
            fuel_type ?? 'AVGAS',
            payload_capacity ?? 0,
            oil_condition ?? 100,
            tire_condition ?? 100,
            engine_condition ?? 100,
            hours_at_last_a ?? 0,
            hours_at_last_b ?? 0,
            hours_at_last_c ?? 0,
            hours_at_last_d ?? 0
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
            locked_by, current_flight, name, manufacturer, year, price, specs,
            fuel_level, fuel_capacity, fuel_type, payload_capacity,
            oil_condition, tire_condition, engine_condition,
            hours_at_last_a, hours_at_last_b, hours_at_last_c, hours_at_last_d
        } = req.body;

        const stmt = db.prepare(`
      UPDATE fleet SET
        registration = ?, type = ?, status = ?, location = ?,
        total_hours = ?, hours_since_inspection = ?,
        next_inspection_due = ?, last_flight = ?, condition = ?,
        condition_details = ?, mel_list = ?, maintenance_notes = ?,
        locked_by = ?, current_flight = ?, name = ?, manufacturer = ?,
        year = ?, price = ?, specs = ?,
        fuel_level = ?, fuel_capacity = ?, fuel_type = ?, payload_capacity = ?,
        oil_condition = ?, tire_condition = ?, engine_condition = ?,
        hours_at_last_a = ?, hours_at_last_b = ?, hours_at_last_c = ?, hours_at_last_d = ?
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
            fuel_level ?? 100,
            fuel_capacity ?? 100,
            fuel_type ?? 'AVGAS',
            payload_capacity ?? 0,
            oil_condition ?? 100,
            tire_condition ?? 100,
            engine_condition ?? 100,
            hours_at_last_a ?? 0,
            hours_at_last_b ?? 0,
            hours_at_last_c ?? 0,
            hours_at_last_d ?? 0,
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

// Refuel aircraft
app.post('/api/fleet/:id/refuel', (req, res) => {
    try {
        const { id } = req.params;
        const { amount, cost } = req.body;

        db.transaction(() => {
            db.prepare('UPDATE fleet SET fuel_level = MIN(fuel_capacity, fuel_level + ?) WHERE id = ?').run(amount, id);
            db.prepare('UPDATE company SET balance = balance - ? WHERE id = 1').run(cost);
        })();

        res.json({ success: true });
    } catch (error) {
        console.error('Error refueling aircraft:', error);
        res.status(500).json({ error: 'Failed to refuel aircraft' });
    }
});

// Repair aircraft
app.post('/api/fleet/:id/repair', (req, res) => {
    try {
        const { id } = req.params;
        const { cost, type } = req.body; // type: 'full', 'oil', 'tires'

        db.transaction(() => {
            if (type === 'full') {
                db.prepare(`
          UPDATE fleet SET 
            oil_condition = 100, 
            tire_condition = 100, 
            engine_condition = 100,
            condition = 'excellent',
            status = 'available'
          WHERE id = ?
        `).run(id);
            } else if (type === 'oil') {
                db.prepare('UPDATE fleet SET oil_condition = 100 WHERE id = ?').run(id);
            } else if (type === 'tires') {
                db.prepare('UPDATE fleet SET tire_condition = 100 WHERE id = ?').run(id);
            }
            db.prepare('UPDATE company SET balance = balance - ? WHERE id = 1').run(cost);
        })();

        res.json({ success: true });
    } catch (error) {
        console.error('Error repairing aircraft:', error);
        res.status(500).json({ error: 'Failed to repair aircraft' });
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
// MISSIONS ENDPOINTS
// ============================================================================

// Get all available missions
app.get('/api/missions', (req, res) => {
    try {
        const missions = db.prepare('SELECT * FROM missions').all();
        const parsed = missions.map(m => ({
            ...m,
            route: {
                from: m.route_from,
                fromCode: m.route_from_code,
                to: m.route_to,
                toCode: m.route_to_code
            },
            cargo: {
                type: m.cargo_type,
                passengers: m.cargo_passengers,
                weight: m.cargo_weight
            },
            requirements: m.requirements ? JSON.parse(m.requirements) : null
        }));
        res.json(parsed);
    } catch (error) {
        console.error('Error fetching missions:', error);
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
});

// Clear and replace all missions (refresh)
app.post('/api/missions/refresh', (req, res) => {
    try {
        const { missions } = req.body;

        db.transaction(() => {
            db.prepare('DELETE FROM missions').run();
            const stmt = db.prepare(`
        INSERT INTO missions (
          id, flight_number, type, priority, 
          route_from, route_from_code, route_to, route_to_code,
          distance, duration, cargo_type, cargo_passengers, cargo_weight,
          earnings, requirements, aircraft_id, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            for (const m of missions) {
                stmt.run(
                    m.id, m.flightNumber, m.type, m.priority,
                    m.route.from, m.route.fromCode, m.route.to, m.route.toCode,
                    m.distance, m.duration, m.cargo.type, m.cargo.passengers, m.cargo.weight,
                    m.earnings, m.requirements ? JSON.stringify(m.requirements) : null,
                    m.aircraftId, m.generatedAt || new Date().toISOString()
                );
            }
        })();

        res.json({ success: true, count: missions.length });
    } catch (error) {
        console.error('Error refreshing missions:', error);
        res.status(500).json({ error: 'Failed to refresh missions' });
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
