export default class Cookies {
    static get(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    static getNumber(name) {
        const raw = Cookies.get(name);
        if (raw === null || raw === '') return null;
        const n = Number(raw);
        return Number.isNaN(n) ? null : n;
    }

    static set(name, val) {
        document.cookie = val === null || val === undefined ?
        `${name}=; path=/; max-age=0` :
        `${name}=${encodeURIComponent(val)}; path=/`;
    }
}