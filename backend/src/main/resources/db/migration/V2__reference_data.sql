-- Reference data: countries, cities, ports (Indian origin + Dubai/international destinations)
-- Subscription plans (default entitlements, prices in INR)

-- Countries
INSERT INTO countries (name, code, currency_code) VALUES
('India', 'IND', 'INR'),
('United Arab Emirates', 'ARE', 'AED'),
('Saudi Arabia', 'SAU', 'SAR'),
('Qatar', 'QAT', 'QAR'),
('Oman', 'OMN', 'OMR'),
('Singapore', 'SGP', 'SGD'),
('Netherlands', 'NLD', 'EUR'),
('United Kingdom', 'GBR', 'GBP');

-- Indian cities
INSERT INTO cities (country_id, name, state) VALUES
((SELECT id FROM countries WHERE code='IND'), 'Mumbai', 'Maharashtra'),
((SELECT id FROM countries WHERE code='IND'), 'Mundra', 'Gujarat'),
((SELECT id FROM countries WHERE code='IND'), 'Kandla', 'Gujarat'),
((SELECT id FROM countries WHERE code='IND'), 'Hazira', 'Gujarat'),
((SELECT id FROM countries WHERE code='IND'), 'Chennai', 'Tamil Nadu'),
((SELECT id FROM countries WHERE code='IND'), 'Cochin', 'Kerala'),
((SELECT id FROM countries WHERE code='IND'), 'Visakhapatnam', 'Andhra Pradesh'),
((SELECT id FROM countries WHERE code='IND'), 'Kolkata', 'West Bengal'),
((SELECT id FROM countries WHERE code='IND'), 'Tuticorin', 'Tamil Nadu');

-- UAE / International cities
INSERT INTO cities (country_id, name, state) VALUES
((SELECT id FROM countries WHERE code='ARE'), 'Dubai', 'Dubai'),
((SELECT id FROM countries WHERE code='ARE'), 'Abu Dhabi', 'Abu Dhabi'),
((SELECT id FROM countries WHERE code='ARE'), 'Khor Fakkan', 'Sharjah'),
((SELECT id FROM countries WHERE code='SAU'), 'Dammam', 'Eastern Province'),
((SELECT id FROM countries WHERE code='SAU'), 'Jeddah', 'Makkah'),
((SELECT id FROM countries WHERE code='QAT'), 'Doha', 'Doha'),
((SELECT id FROM countries WHERE code='OMN'), 'Sohar', 'Sohar'),
((SELECT id FROM countries WHERE code='SGP'), 'Singapore', 'Singapore'),
((SELECT id FROM countries WHERE code='NLD'), 'Rotterdam', 'South Holland'),
((SELECT id FROM countries WHERE code='GBR'), 'Felixstowe', 'Suffolk');

-- Indian origin ports
INSERT INTO ports (country_id, city_id, name, unlocode, port_type, country_name, city_name, supports_container, supports_reefer, active) VALUES
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Mumbai'), 'JNPA / Nhava Sheva', 'INNSA', 'ORIGIN', 'India', 'Mumbai', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Mumbai'), 'Mumbai Port', 'INBOM', 'ORIGIN', 'India', 'Mumbai', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Mundra'), 'Mundra Port', 'INMUN', 'ORIGIN', 'India', 'Mundra', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Kandla'), 'Deendayal / Kandla', 'INIXY', 'ORIGIN', 'India', 'Kandla', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Hazira'), 'Hazira Port', 'INHZA', 'ORIGIN', 'India', 'Hazira', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Chennai'), 'Chennai Port', 'INMAA', 'ORIGIN', 'India', 'Chennai', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Cochin'), 'Cochin Port', 'INCOK', 'ORIGIN', 'India', 'Cochin', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Visakhapatnam'), 'Visakhapatnam Port', 'INVTZ', 'ORIGIN', 'India', 'Visakhapatnam', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Kolkata'), 'Kolkata/Haldia', 'INCCU', 'ORIGIN', 'India', 'Kolkata', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='IND'), (SELECT id FROM cities WHERE name='Tuticorin'), 'V.O. Chidambaranar', 'INTUT', 'ORIGIN', 'India', 'Tuticorin', TRUE, TRUE, TRUE);

-- Dubai / International destination ports
INSERT INTO ports (country_id, city_id, name, unlocode, port_type, country_name, city_name, supports_container, supports_reefer, active) VALUES
((SELECT id FROM countries WHERE code='ARE'), (SELECT id FROM cities WHERE name='Dubai'), 'Jebel Ali Port, Dubai', 'AEJEA', 'DESTINATION', 'UAE', 'Dubai', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='ARE'), (SELECT id FROM cities WHERE name='Abu Dhabi'), 'Khalifa Port, Abu Dhabi', 'AUAUH', 'DESTINATION', 'UAE', 'Abu Dhabi', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='ARE'), (SELECT id FROM cities WHERE name='Khor Fakkan'), 'Khor Fakkan Port', 'AEKLF', 'DESTINATION', 'UAE', 'Khor Fakkan', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='SAU'), (SELECT id FROM cities WHERE name='Dammam'), 'Dammam Port', 'SADMM', 'DESTINATION', 'Saudi Arabia', 'Dammam', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='SAU'), (SELECT id FROM cities WHERE name='Jeddah'), 'Jeddah Port', 'SAJED', 'DESTINATION', 'Saudi Arabia', 'Jeddah', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='QAT'), (SELECT id FROM cities WHERE name='Doha'), 'Hamad Port', 'QAHDD', 'DESTINATION', 'Qatar', 'Doha', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='OMN'), (SELECT id FROM cities WHERE name='Sohar'), 'Sohar Port', 'OMSOH', 'DESTINATION', 'Oman', 'Sohar', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='SGP'), (SELECT id FROM cities WHERE name='Singapore'), 'Port of Singapore', 'SGSIN', 'DESTINATION', 'Singapore', 'Singapore', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='NLD'), (SELECT id FROM cities WHERE name='Rotterdam'), 'Port of Rotterdam', 'NLRTM', 'DESTINATION', 'Netherlands', 'Rotterdam', TRUE, TRUE, TRUE),
((SELECT id FROM countries WHERE code='GBR'), (SELECT id FROM cities WHERE name='Felixstowe'), 'Port of Felixstowe', 'GBFEL', 'DESTINATION', 'United Kingdom', 'Felixstowe', TRUE, TRUE, TRUE);

-- Subscription plans
INSERT INTO subscription_plans (name, description, price_amount, currency, billing_cycle, razorpay_plan_id, dubai_rates_access, calculator_access, pdf_export_access, saved_calculations_access, active, sort_order) VALUES
('Monthly', 'Monthly access to Dubai market rates and export calculator', 49900, 'INR', 'MONTHLY', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, 1),
('Quarterly', 'Quarterly access to Dubai market rates and export calculator', 129900, 'INR', 'QUARTERLY', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, 2),
('Yearly', 'Yearly access to Dubai market rates and export calculator', 499900, 'INR', 'YEARLY', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, 3);
