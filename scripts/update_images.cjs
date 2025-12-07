
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    { name: 'Catering', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Cakes', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Cars', url: 'https://images.unsplash.com/photo-1549050006-3809b3680353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Flowers & Decoration', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Invitations & Stationery', url: 'https://images.unsplash.com/photo-1595066036340-d2454f703885?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Rings', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Videography', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Photobox', url: 'https://images.unsplash.com/photo-1523407280038-1c24777d004e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'DJs', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Musicians', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Entertainment', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Venues', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Bridal Fashion', url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Groom Suits', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Hair & Make-Up', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Photography', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Wedding Planners', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];

async function updateImages() {
    console.log('Starting update...');
    for (const item of updates) {
        const { error } = await supabase
            .from('categories')
            .update({ image_url: item.url })
            .eq('name', item.name);

        if (error) {
            console.error(`Error updating ${item.name}:`, error);
        } else {
            console.log(`Updated ${item.name}`);
        }
    }
    console.log('Done.');
}

updateImages();
