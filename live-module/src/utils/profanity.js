const badWords = [
    'küfür1', 'küfür2', 'lan', 'aptal', 'salak', // Add more as needed
    'idiot', 'stupid', 'fuck', 'shit'
];

export const containsProfanity = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
};

export const filterProfanity = (text) => {
    if (!text) return text;
    let filtered = text;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
};
