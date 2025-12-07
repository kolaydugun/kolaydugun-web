import { useEffect } from 'react';

export const usePageTitle = (title) => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = `${title} | KolayDugun`;

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
};

export default usePageTitle;

