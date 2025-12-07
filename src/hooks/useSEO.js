import { useEffect } from 'react';

const useSEO = ({ title, description }) => {
    useEffect(() => {
        const prevTitle = document.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        const prevDescription = metaDescription ? metaDescription.getAttribute('content') : '';

        // Update Title
        if (title) {
            document.title = `${title} | KolayDugun.de`;
        }

        // Update Meta Description
        if (description) {
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = description;
                document.head.appendChild(meta);
            }
        }

        return () => {
            document.title = prevTitle;
            if (metaDescription) {
                metaDescription.setAttribute('content', prevDescription);
            }
        };
    }, [title, description]);
};

export default useSEO;
