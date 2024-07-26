export function timestampToHourMinute(timestampSeconds: number): string {
    const options = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    };
    const date = new Date(timestampSeconds * 1000); // 将秒转换为毫秒
    // 使用 Intl.DateTimeFormat 对象格式化时间
    return Intl.DateTimeFormat('en-US', options).format(date);

    // const date = new Date(timestampSeconds * 1000); // 将秒转换为毫秒
    // const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，并添加前导零
    // const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，并添加前导零
    // return `${hours}:${minutes}`; // 返回时分字符串
}

export function timestampToHourMinuteSecond(timestampSeconds: number): string {
    const options = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const date = new Date(timestampSeconds * 1000); // 将秒转换为毫秒
    // 使用 Intl.DateTimeFormat 对象格式化时间
    return Intl.DateTimeFormat('en-US', options).format(date);

    // const date = new Date(timestampSeconds * 1000); // 将秒转换为毫秒
    // const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，并添加前导零
    // const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，并添加前导零
    // const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取分钟，并添加前导零
    // return `${hours}:${minutes}:${seconds}`; // 返回时分字符串
}

export function timestampFormat(timestampSeconds: number): string {
    const date = new Date(timestampSeconds); // 将秒转换为毫秒
    // 设置时区为 "Europe/London"
    const options = {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    // 使用 Intl.DateTimeFormat 对象格式化时间
    return new Intl.DateTimeFormat('en-US', options).format(date);
    // return date.toLocaleString();
}

export function timestampBarFormat(timestampSeconds: number): string {
    const date = new Date(timestampSeconds); // 将秒转换为毫秒
    // 设置时区为 "Europe/London"
    const options = {
        timeZone: 'UTC',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 添加此行以使用24小时制
    };
    // 使用 Intl.DateTimeFormat 对象格式化时间
    return new Intl.DateTimeFormat('en-US', options).format(date);
    // return date.toLocaleString();
}

function gettimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}