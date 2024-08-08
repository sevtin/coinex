
export function toPercentage(num: number): string {
    // 将数字乘以 100 并保留两位小数
    const percentage = (num * 100).toFixed(2);
    return `${percentage}%`;
}
export function stringToNumber(str) {
    // 将字符串转换为浮点数
    let num = parseFloat(str);
    // 如果转换失败，返回NaN
    if (isNaN(num)) {
        return 0;
    }
    // 格式化浮点数，保留最多8位小数
    return parseFloat(num.toFixed(8));
}