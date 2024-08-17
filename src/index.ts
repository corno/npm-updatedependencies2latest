#!/usr/bin/env node

import * as cp from "child_process"

if (process.argv.length < 4) {
    console.error("usage: dirContainingPackage.json dependencies|devDependencies [verbose]")
    process.exit(1)
}

const contextDir = process.argv[2]
const dependencyType = process.argv[3]
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
                console.error(`the following is not valid JSON: ${stdout}`)
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