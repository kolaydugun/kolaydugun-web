const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Using placeholder.com which definitely works
const updates = [
    { name: 'Catering', url: 'https://via.placeholder.com/800x600/FF6B9D/FFFFFF?text=Catering' },
    { name: 'Wedding Cakes', url: 'https://via.placeholder.com/800x600/C44569/FFFFFF?text=Wedding+Cakes' },
    { name: 'Wedding Cars', url: 'https://via.placeholder.com/800x600/12CBC4/FFFFFF?text=Wedding+Cars' },
    { name: 'Flowers & Decoration', url: 'https://via.placeholder.com/800x600/FDA7DF/FFFFFF?text=Flowers' },
    { name: 'Invitations & Stationery', url: 'https://via.placeholder.com/800x600/ED4C67/FFFFFF?text=Invitations' },
    { name: 'Wedding Rings', url: 'https://via.placeholder.com/800x600/F79F1F/FFFFFF?text=Rings' },
    { name: 'Wedding Videography', url: 'https://via.placeholder.com/800x600/A3CB38/FFFFFF?text=Video' },
    { name: 'Photobox', url: 'https://via.placeholder.com/800x600/1289A7/FFFFFF?text=Photobox' },
    { name: 'DJs', url: 'https://via.placeholder.com/800x600/D980FA/FFFFFF?text=DJs' },
    { name: 'Musicians', url: 'https://via.placeholder.com/800x600/B53471/FFFFFF?text=Musicians' },
    { name: 'Entertainment', url: 'https://via.placeholder.com/800x600/EE5A6F/FFFFFF?text=Entertainment' },
    { name: 'Wedding Venues', url: 'https://via.placeholder.com/800x600/0652DD/FFFFFF?text=Venues' },
    { name: 'Bridal Fashion', url: 'https://via.placeholder.com/800x600/9980FA/FFFFFF?text=Bridal+Fashion' },
    { name: 'Groom Suits', url: 'https://via.placeholder.com/800x600/833471/FFFFFF?text=Groom+Suits' },
    { name: 'Hair & Make-Up', url: 'https://via.placeholder.com/800x600/FDA7DF/FFFFFF?text=Hair+Makeup' },
    { name: 'Wedding Photography', url: 'https://via.placeholder.com/800x600/FFC312/FFFFFF?text=Photography' },
    { name: 'Wedding Planners', url: 'https://via.placeholder.com/800x600/C4E538/FFFFFF?text=Planners' }
];

async function updateImages() {
    console.log('Starting update with placeholder images...');
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
