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
            const versions: [string, string][] = []
            function push(key: string, version: string) {
                versions.push([key, version])
                if (versions.length === dependencies.length) {
                    versions.forEach(($) => {
                        //console.log(`KEY VERSION: ${key}:${stdout.trimEnd()}`)
                        cp.exec(`npm pkg set "dependencies.${$[0]}"="^${$[1]}" --prefix ${contextDir}`, (err, stdout, stderr) => {
                            //console.log(`KEY SET: ${key}`)
                            if (err !== null) {
                                console.error(`could not set dependency version: ${stderr}`);
                                process.exit(1);
                            }
                            else {
                            }
                        });
                    })
                }
            }
            dependencies.forEach((key) => {
                //console.log(`KEY: ${key}`)
                cp.exec(`npm view ${key}@latest version`, (err, stdout, stderr) => {
                    if (err !== null) {
                        console.error(`could not retrieve latest version: ${stderr}`);
                        process.exit(1);
                    } else {
                        push(key, stdout.trimEnd())
                    }
                });
            })
        }
    }
)