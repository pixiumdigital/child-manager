import { ChildManager } from '../ChildManager'
import * as path from 'path'
jest.setTimeout(30000);

const testServicePath = path.join(process.cwd(), 'src', 'service')

const lib = new ChildManager({
    processes: [{
        name: "Test Service",
        command: {
            executor: "node",
            args: ["TestService.js"],
            path: testServicePath,
            isWindows: false
        },
        maxLogs: 20
    }],
    captureExit: true,
    longLive: false,
    debug: false,
})


test('ChildManager processStarted', () => {
    expect(Object.keys(lib.processes).length).toStrictEqual(1);
});

test('ChildManager nonEmptyLogs', async () => {
    await new Promise((r) => setTimeout(r, 10000));
    const plop = Object.keys(lib.processes).map(e => {
        return lib.processes[e].logs.values
    })
    expect(plop[0].length).toBeGreaterThan(1);
    lib.killChildren()
});

//lib.killChildren()