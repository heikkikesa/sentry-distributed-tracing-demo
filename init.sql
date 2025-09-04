-- Create the widgets table
CREATE TABLE IF NOT EXISTS widgets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert sample data
INSERT INTO widgets (name, price) VALUES 
    ('Gadget', 19.99),
    ('Doohickey', 29.99),
    ('Whatsit', 9.99)
ON CONFLICT DO NOTHING;
