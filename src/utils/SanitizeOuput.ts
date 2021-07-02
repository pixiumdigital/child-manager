export const SanitizeOutput = (str: string) => {
    const ansiCodeRg = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
    const clean = str.replace(ansiCodeRg, '')
    return clean
}