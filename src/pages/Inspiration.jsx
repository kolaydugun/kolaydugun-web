import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Inspiration.css';

// Mock Data for Inspiration
const INSPIRATION_IMAGES = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        category: 'venue',
        title: 'Rustic Barn Wedding'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1511285560982-1356c11d4606?auto=format&fit=crop&q=80&w=800',
        category: 'decor',
        title: 'Elegant Table Setting'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800',
        category: 'dress',
        title: 'Lace Bridal Gown'
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800',
        category: 'cake',
        title: 'Floral Wedding Cake'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=800',
        category: 'venue',
        title: 'Garden Ceremony'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
        category: 'flowers',
        title: 'Bridal Bouquet'
    },
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&q=80&w=800',
        category: 'venue',
        title: 'Luxury Ballroom'
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1522673607200-1645062cd958?auto=format&fit=crop&q=80&w=800',
        category: 'decor',
        title: 'Boho Chic Decor'
    },
    {
        id: 9,
        url: 'https://images.unsplash.com/photo-1595867865332-acd6237970fd?auto=format&fit=crop&q=80&w=800',
        category: 'dress',
        title: 'Modern Minimalist Dress'
    },
    {
        id: 10,
        url: 'https://images.unsplash.com/photo-1562601579-599dec564e06?auto=format&fit=crop&q=80&w=800',
        category: 'cake',
        title: 'Naked Cake with Berries'
    },
    {
        id: 11,
        url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
        category: 'venue',
        title: 'Beach Wedding Setup'
    },
    {
        id: 12,
        url: 'https://images.unsplash.com/photo-1507504031981-723e9edd9920?auto=format&fit=crop&q=80&w=800',
        category: 'flowers',
        title: 'Centerpiece Arrangement'
    }
];

const Inspiration = () => {
    const { t } = useLanguage();
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);

    const categories = [
        { id: 'all', label: t('filters.all') || 'Tümü' },
        { id: 'venue', label: t('featured.venue') || 'Mekanlar' },
        { id: 'decor', label: t('featured.decor') || 'Dekorasyon' },
        { id: 'dress', label: t('featured.dress') || 'Gelinlik' },
        { id: 'flowers', label: t('featured.flowers') || 'Çiçekler' },
        { id: 'cake', label: t('featured.cake') || 'Pasta' }
    ];

    const filteredImages = useMemo(() => {
        if (activeFilter === 'all') return INSPIRATION_IMAGES;
        return INSPIRATION_IMAGES.filter(img => img.category === activeFilter);
    }, [activeFilter]);

    return (
        <div className="inspiration-page section container">
            <div className="inspiration-header">
                <h1>{t('nav.inspiration') || 'İlham'}</h1>
                <p>{t('hero.subtitle') || 'En ince ayrıntısına kadar mükemmellik. Unutulmaz anlar tasarlıyoruz.'}</p>
            </div>

            <div className="filter-tabs">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-tab ${activeFilter === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveFilter(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="masonry-grid">
                {filteredImages.map(image => (
                    <div
                        key={image.id}
                        className="inspiration-card"
                        onClick={() => setSelectedImage(image)}
                    >
                        <img src={image.url} alt={image.title} loading="lazy" />
                        <div className="card-overlay">
                            <span className="card-category">
                                {categories.find(c => c.id === image.category)?.label}
                            </span>
                            <h3 className="card-title">{image.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                            &times;
                        </button>
                        <img src={selectedImage.url} alt={selectedImage.title} className="lightbox-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inspiration;
