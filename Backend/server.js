const app = require('./app'); // Double check: NO curly braces!
const db = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Verify Database Connection Pool Availability
db.query('SELECT NOW();')
    .then((res) => {
        console.log(`Database connectivity verified at timestamp: ${res.rows[0].now}`);
        
        // Open Network Ports cleanly here
        const server = app.listen(PORT, () => {
            console.log(`Application boot completed. Listening on interface runtime port: ${PORT}`);
        });

        // Graceful Shutdown
        const shutDownGracefully = (signal) => {
            console.log(`Received ${signal}. Shutting down gracefully.`);
            server.close(async () => {
                await db.end();
                console.log('PostgreSQL pools terminated safely.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutDownGracefully('SIGTERM'));
        process.on('SIGINT', () => shutDownGracefully('SIGINT'));
    })
    .catch((err) => {
        console.error('Critical Database connection handshake failure during boot:', err);
        process.exit(1);
    });
