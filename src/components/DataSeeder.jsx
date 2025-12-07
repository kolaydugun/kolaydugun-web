import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const INITIAL_VENDORS = [
    {
        business_name: "Schloss Charlottenburg",
        category: "Hochzeitslocations",
        city: "Berlin",
        description: "Erleben Sie eine märchenhafte Hochzeit im historischen Schloss Charlottenburg.",
        price_range: "€€€€",
        capacity: 250,
        rating: 4.9,
        image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: true,
        featured_until: "2026-01-01T00:00:00Z"
    },
    {
        business_name: "Elegant Catering Co.",
        category: "Catering & Partyservice",
        city: "München",
        description: "Exquisite kulinarische Erlebnisse für Ihren besonderen Tag.",
        price_range: "€€€",
        capacity: 150,
        rating: 4.8,
        image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    },
    {
        business_name: "Floral Dreams",
        category: "Blumen & Deko",
        city: "Hamburg",
        description: "Wir verwandeln Ihre Blumenträume in Wirklichkeit.",
        price_range: "€€",
        capacity: 80,
        rating: 4.7,
        image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    },
    {
        business_name: "Berlin Wedding Photography",
        category: "Hochzeitsfotos",
        city: "Berlin",
        description: "Capturing your special moments forever.",
        price_range: "€€€",
        capacity: 0,
        rating: 4.9,
        image_url: "https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: true,
        featured_until: "2026-01-01T00:00:00Z"
    },
    {
        business_name: "Hamburg Harbor Venue",
        category: "Hochzeitslocations",
        city: "Hamburg",
        description: "Modern venue with a view of the harbor.",
        price_range: "€€€€",
        capacity: 300,
        rating: 4.6,
        image_url: "https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    },
    {
        business_name: "Munich Traditional Band",
        category: "Musik",
        city: "München",
        description: "Traditional Bavarian music for your wedding.",
        price_range: "€€",
        capacity: 0,
        rating: 4.8,
        image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    },
    {
        business_name: "Cologne Cathedral View",
        category: "Hochzeitslocations",
        city: "Köln",
        description: "Celebrate with a view of the Dom.",
        price_range: "€€€",
        capacity: 120,
        rating: 4.7,
        image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: true,
        featured_until: "2026-01-01T00:00:00Z"
    },
    {
        business_name: "Frankfurt Skyline Loft",
        category: "Hochzeitslocations",
        city: "Frankfurt",
        description: "Luxury loft with skyline views.",
        price_range: "€€€€",
        capacity: 100,
        rating: 4.9,
        image_url: "https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: true,
        featured_until: "2026-01-01T00:00:00Z"
    },
    {
        business_name: "Stuttgart Vineyard",
        category: "Hochzeitslocations",
        city: "Stuttgart",
        description: "Romantic wedding in the vineyards.",
        price_range: "€€",
        capacity: 80,
        rating: 4.5,
        image_url: "https://images.unsplash.com/photo-1522673607200-1645062cd495?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    },
    {
        business_name: "Düsseldorf Fashion Hotel",
        category: "Hochzeitslocations",
        city: "Düsseldorf",
        description: "Chic hotel for a stylish wedding.",
        price_range: "€€€",
        capacity: 200,
        rating: 4.4,
        image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        featured_active: false
    }
];

const DataSeeder = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const seedData = async () => {
        setLoading(true);
        setStatus('Starting seed...');

        try {
            // We need to create a profile for each vendor first because of foreign key constraint
            // This is tricky because we need auth users.
            // Actually, for a real seed we'd need to create auth users via admin API which we don't have access to here easily without service role key.
            // BUT, if we relax the constraint or just insert into vendors if we change the schema...
            // The schema says: id uuid references public.profiles(id)

            // Alternative: We just display this component and tell the user "Hey, to see data, you need to register vendors".
            // OR, we can create a "Demo Mode" in the context that uses mock data if DB is empty.

            // Let's try to create a dummy user for each? No, that requires signup.

            setStatus('Cannot seed directly without Admin API. Please register manually or use the app to create vendors.');
        } catch (error) {
            setStatus('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, background: '#f0f0f0', margin: 20 }}>
            <h3>Data Seeder</h3>
            <p>Note: Due to security constraints (Auth), we cannot bulk insert vendors without creating Auth users first.</p>
            <p>Please register new vendors via the "Register" page to populate the database.</p>
        </div>
    );
};

export default DataSeeder;
