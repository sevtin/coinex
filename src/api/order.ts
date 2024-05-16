import xhttp from "@/pkg/xhttp/xhttp";

export interface Order {
    market_id: number; // 市场ID
    order_type: number; // 1: Limit, 2: Market
    side: number; // 1: Buy, 2: Sell
    price: number; // 价格
    qty: number; // 数量
}

export interface OrderInfo {
    order_id: bigInt.BigInteger;
    market_id: number;
    uid: bigint;
    side: number;
    order_type: number;
    order_status: number;
    price: number;
    unfilled_qty: number;
    filled_qty: number;
    filled_amt: number;
    fee_rate: number;
    fee: number;
    ver: number;
    created_ts: number;
    symbol: string;
    ts_str: string;
    side_str: string;
    order_type_str: string;
    order_status_str: string;
    price_str: string;
    qty_str: string;
    filled_amt_str: string;
}

enum Side {
    Unknown = 0,
    Buy = 1,
    Sell = 2
}

enum OrderType {
    Unknown = 0,
    Limit = 1,
    Market = 2,
    StopLoss = 3,
    StopLossLimit = 4,
    TakeProfit = 5,
    LimitTakeProfit = 6,
    LimitMaker = 7
}

enum OrderStatus {
    Pending = 0,
    PartiallyFilled = 1,
    FullyFilled = 2,
    Canceled = 3,
    Rejected = 4
}

export function createOrder(params?: object) {
    return xhttp.post("/api/order/create", params)
}

export function cancelOrder(params?: object) {
    return xhttp.post("/api/order/cancel", params)
}

export function orderList(params?: object) {
    return xhttp.get<OrderInfo[]>("/api/order/list", params)
}