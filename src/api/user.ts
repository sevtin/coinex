import xhttp from "@/pkg/xhttp/xhttp";
import bigInt from 'big-integer';


export interface User {
    uid: bigInt.BigInteger;
}

export function createGuest() {
    return xhttp.post<User>("/open/user/create_guest")
}
