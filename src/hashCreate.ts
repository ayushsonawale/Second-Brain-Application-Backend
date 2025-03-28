export function randomHashCreate(len: number){
    let option = "qwertyuiopasdfghjklzxcvbnm12345";
    let length = option.length

    let ans = "";

    for(let i = 0; i < len; i++){
        ans += option[Math.floor((Math.random() * length))]

    }
    return ans
}