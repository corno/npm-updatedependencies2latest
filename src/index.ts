#!/usr/bin/env node

import * as cp from "child_process"

if (process.argv.length < 4) {
    console.error("usage: 'directory containing the package.json' dependencies|devDependencies [verbose]")
    process.exit(1)
}

const contextDir = process.argv[2]
const dependencyType = process.argv[3]

if (dependencyType !== "dependencies" && dependencyType !== "devDependencies" ) {
    console.error("for the 2nd parameter choose either 'dependencies' or 'devDependencies'")
    process.exit(1)
}

if (process.argv[4] !== undefined && process.argv[4] !== "verbose" ) {
    console.error("3rd parameter should be omitted or the word 'verbose'")
    process.exit(1)
}


const verbose = process.argv[4] !== undefined

cp.exec(
    `npm pkg get "${dependencyType}" --prefix ${contextDir}`,
    (err, stdout, stderr) => {
        if (err !== null) {
            console.error(`${stderr}`)
            process.exit(1)
        } else {
            try {
                JSON.parse(stdout)
            } catch (e) {
                console.error(`the command that was run: npm pkg get "${dependencyType}" --prefix ${contextDir}`)
                console.error(`the following is not valid JSON: '${stdout}'`)
                process.exit(1)
            }
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
                        cp.exec(`npm pkg set ${versions.map(($) => `${dependencyType}.${$[0]}="^${$[1]}"`).join(" ")} --prefix ${contextDir}`, (err, stdout, stderr) => {
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