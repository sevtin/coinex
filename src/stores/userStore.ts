import {defineStore} from 'pinia'
import Cookies from 'js-cookie'
import type {User} from "@/api/user";
import {createGuest} from "@/api/user";

export const useUserStore = defineStore('user', {
    state: (): User => ({
        signed: Boolean(Cookies.get('signed')),
    }),
    getters: {
        isSigned(): boolean {
            return this.signed
        }
    },
    actions: {
        setSigned(signed: boolean) {
            this.signed = signed
        },
    },
    persist: true
})
