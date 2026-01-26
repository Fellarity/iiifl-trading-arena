// Simple Moving Average
export const calculateSMA = (data: any[], period: number) => {
    let sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push({ x: data[i].x, y: null });
            continue;
        }
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].y[3]; // Close price is index 3
        }
        sma.push({ x: data[i].x, y: parseFloat((sum / period).toFixed(2)) });
    }
    return sma;
};

// Exponential Moving Average
export const calculateEMA = (data: any[], period: number) => {
    let ema = [];
    const k = 2 / (period + 1);
    
    // Start with SMA for first point
    let sum = 0;
    for (let j = 0; j < period; j++) {
        sum += data[period - 1 - j].y[3];
    }
    let prevEma = sum / period;

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            ema.push({ x: data[i].x, y: null });
            continue;
        }
        if (i === period - 1) {
            ema.push({ x: data[i].x, y: parseFloat(prevEma.toFixed(2)) });
            continue;
        }
        
        let close = data[i].y[3];
        let currentEma = (close - prevEma) * k + prevEma;
        ema.push({ x: data[i].x, y: parseFloat(currentEma.toFixed(2)) });
        prevEma = currentEma;
    }
    return ema;
};
