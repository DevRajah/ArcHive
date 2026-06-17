export const calculateConfidenceScore = (
    score: number,
    threshold: number
) => {
    if (score >= threshold + 60) {
        return 99;
    }

    if (score >= threshold + 40) {
        return 95;
    }

    if (score >= threshold + 25) {
        return 90;
    }

    if (score >= threshold + 15) {
        return 85;
    }

    if (score >= threshold) {
        return 75;
    }

    return 0;
};