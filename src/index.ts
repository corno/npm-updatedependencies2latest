import * as cp from "child_process"

if (process.argv.length < 3) {
    throw new Error("expected path to dir containing package.json")
}

const contextDir = process.argv[2]
const verbose = process.argv[3] !== undefined

cp.exec(
    `npm pkg get "dependencies" --prefix ${contextDir}`,
    (err, stdout, stderr) => {
        if (err !== null) {
            console.error(`${stderr}`)
            process.exit(1)
        } else {
            const dependencies = Object.keys(JSON.parse(stdout))
            if (dependencies.length === 0) {
                if (verbose) {
                    console.log("-no dependencies-")
                }
            } else {
                const versions: [string, string][] = []
                function push(key: string, version: string) {
                    versions.push([key, version])
                    if (versions.length === dependencies.length) {
                        cp.exec(`npm pkg set ${versions.map(($) => `" dependencies.${$[0]}"="^${$[1]}"`)} --prefix ${contextDir}`, (err, stdout, stderr) => {
                            if (verbose) {
                                versions.forEach(($) => {
                                    console.log(`${$[0]}:${$[1]}`)
                                })
                            }
                            if (err !== null) {
                                console.error(`could not set dependency versions: ${stderr}`);
                                process.exit(1);
                            }
                        });
                        
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
    }
)