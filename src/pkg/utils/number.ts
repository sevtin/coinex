
export function toPercentage(num: number): string {
    // 将数字乘以 100 并保留两位小数
    const percentage = (num * 100).toFixed(2);
    return `${percentage}%`;
}