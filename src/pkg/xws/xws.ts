import Cookies from 'js-cookie'

export interface Message {
    method: string;
    data: any;
}

export interface Subscribe {
    topic: string;
    data: any;
}

type OpenEventHandler = () => void;
type MessageEventHandler = (message: Subscribe) => void;
type ErrorHandler = (error: Event) => void;
type CloseEventHandler = (event: CloseEvent) => void;

export class WebSocketClient {
    private socket: WebSocket | null;
    private openHandler: OpenEventHandler | null;
    private messageHandler: MessageEventHandler | null;
    private errorHandler: ErrorHandler | null;
    private closeHandler: CloseEventHandler | null;
    private topics: string[];

    private connectCount: number = 0;
    private readonly maxConnectCount: number = 10;
    private readonly reconnectInterval: number = 3000; // 重连间隔时间（毫秒）
    private reconnecting: boolean = false;

    // 心跳检测相关方法
    private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private heartbeatCount: number = 0;

    constructor(
        openCallback: OpenEventHandler = () => {
        },
        messageCallback: MessageEventHandler = (_: Subscribe) => {
        },
        errorCallback: ErrorHandler = (_) => {
        },
        closeCallback: CloseEventHandler = (_) => {
        }
    ) {
        this.socket = null;
        this.openHandler = openCallback;
        this.messageHandler = messageCallback;
        this.errorHandler = errorCallback;
        this.closeHandler = closeCallback;
    }

    public setTopics(topics: string[]): void {
        this.topics = topics;
    }

    public updateSubscribe(topics: string[]) {
        const msg = {
            method: "UPDATE_SUBSCRIBE",
            data: [this.topics, topics], //0: old topics, 1: new topics
        }
        this.topics = topics
        this.sendMessage(msg)
    }

    public updateUnSubscribe(oldTopic: string, newTopic: string) {
        const msg = {
            method: "UPDATE_SUBSCRIBE",
            data: [[oldTopic], [newTopic]],
        }
        this.topics = this.topics.filter(item => item !== oldTopic);
        this.topics.push(newTopic)
        this.sendMessage(msg)
    }

    public connect(): void {
        this.connectCount++;
        const url = this.getWebSocketUrl();
        try {
            this.socket = new WebSocket(url);
            this.setupSocketEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    // 发送消息方法
    public sendMessage(message: Message): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('Failed to send message. WebSocket not connected.');
        }
    }

    private getWebSocketUrl(): string {
        const token = Cookies.get('token') as string
        const baseUrl = import.meta.env.VITE_WS_URL;
        return `${baseUrl}?topics=${this.topics.join(",")}&token=${token}`;
    }

    private setupSocketEventHandlers(): void {
        // 连接打开事件处理
        this.socket.addEventListener('open', (event: Event) => {
            this.connectCount = 0;
            this.reconnecting = false;
            this.openHandler();
            // 开启心跳检测
            this.startHeartbeat();
        });

        // 消息接收事件处理
        this.socket.addEventListener('message', (event: MessageEvent<string>) => {
            this.handleMessageEvent(event);
        });

        // 错误事件处理
        this.socket.addEventListener('error', (event: Event) => {
            this.handleErrorEvent(event)
        });

        // 连接关闭事件处理
        this.socket.addEventListener('close', (event: CloseEvent) => {
            this.handleCloseEvent(event)
        });
    }

    private handleMessageEvent(event: MessageEvent<string>) {
        // console.log("接收ws消息:", event.data);
        // 收到消息后重置心跳计数器
        this.resetHeartbeat();
        const data = event.data;
        switch (data) {
            case 'PONG':
                return;
            case 'PING':
                this.sendPong();
                return;
        }
        try {
            const messageData: Subscribe = JSON.parse(data);
            this.messageHandler(messageData);
        } catch (err) {
            console.log('Failed to parse message:', err);
        }
    }

    private handleErrorEvent(event: Event): void {
        this.errorHandler(event);
        this.scheduleReconnect();
    }

    private handleCloseEvent(event: CloseEvent): void {
        this.stopHeartbeat();
        if (!this.reconnecting) {
            this.closeHandler(event);
        }
        if (!event.wasClean) {
            // 非正常关闭时尝试重连
            console.log('Connection closed unexpectedly. Reconnecting...');
            // 先关闭现有的连接
            this.closeSocket();
            // 然后尝试重新连接
            this.reconnect();
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.sendPing();
            // 设置心跳超时时间
            this.heartbeatTimeout = setTimeout(() => {
                this.handleHeartbeatTimeout();
            }, 5000); // 设置超时时间为 5 秒
        }, 30000); // 设置心跳间隔为 30 秒
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
    }

    private resetHeartbeat(): void {
        this.heartbeatCount = 0;
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
    }

    private sendPing(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send("PING");
            } catch (err) {
                console.error("Error sending PING:", err);
                this.handleErrorEvent(new Event('error'));
            }
        } else {
            console.warn("Cannot send PING: WebSocket not open.");
            this.stopHeartbeat();
        }
    }

    private sendPong(): void {
        this.socket?.send("PONG");
    }

    private handleHeartbeatTimeout(): void {
        this.heartbeatCount++;
        if (this.heartbeatCount >= 3) {
            // 连续 3 次心跳超时，关闭连接
            console.log('Heartbeat failed. Closing connection.');
            this.closeSocket();
        } else {
            // 重试发送心跳
            console.log('Heartbeat timeout. Retrying...');
            this.resetHeartbeat();
        }
    }

    public closeSocket(): void {
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN ||
                this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }
            this.socket = null;
        }
        this.stopHeartbeat();
    }

    private reconnect(): void {
        if (!this.reconnecting) {
            this.reconnecting = true;
            this.closeSocket(); // 确保旧连接已关闭
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.connectCount <= this.maxConnectCount) {
            setTimeout(() => {
                console.log('Reconnecting...');
                this.connect();
            }, this.reconnectInterval);
        }
    }
}
