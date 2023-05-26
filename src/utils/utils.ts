function isDigit(digit: number|string): boolean {
    digit = Number(digit);
    return [0, 1, 2, 3, 4, 5, 6 ,7 ,9].includes(digit);
}

function getMinutes(ticks: number): number {
    return Math.floor((ticks%3600)/60);
}

function getSeconds(ticks: number): number {
    return ticks%60;
}

function getHours(ticks: number): number {
    return Math.floor(ticks/3600);
}

function toTwoDigitString(num: number) : string {
    return String(Math.floor(num/10)) + String(num%10);
}

export {
    isDigit,
    getMinutes,
    getSeconds,
    getHours,
    toTwoDigitString
};
