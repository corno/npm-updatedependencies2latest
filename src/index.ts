import * as cp from "child_process"

if (process.argv.length !== 3) {
    throw new Error("expected path to dir containing package.json")
}

const contextDir = process.argv[2]

cp.exec(
    `npm pkg get "dependencies" --prefix ${contextDir}`,
    (err, stdout, stderr) => {
        if (err !== null) {
            console.error(`${stderr}`)
            process.exit(1)
        } else {
            const dependencies = Object.keys(JSON.parse(stdout))
            function doNext() {
                const next = dependencies.pop()
                if (next !== undefined) {
                    const key = next
    
                    //console.log(`KEY: ${key}`)
                    cp.exec(`npm view ${key}@latest version`, (err, stdout, stderr) => {
                        if (err !== null) {
                            console.error(`could not retrieve latest version: ${stderr}`);
                            process.exit(1);
                        } else {
                            //console.log(`KEY VERSION: ${key}:${stdout.trimEnd()}`)
                            cp.exec(`npm pkg set "dependencies.${key}"="^${stdout.trimEnd()}" --prefix ${contextDir}`, (err, stdout, stderr) => {
                                //console.log(`KEY SET: ${key}`)
                                if (err !== null) {
                                    console.error(`could not set dependency version: ${stderr}`);
                                    process.exit(1);
                                }
                                else {
                                    doNext()
                                }
                            });
                        }
                    });
                }
            }
            doNext()
        }
    }
)