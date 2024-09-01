#!/usr/bin/env node

import * as cp from "child_process"
import { argv, cwd } from "process"

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

const beVerbose = process.argv[4] !== undefined

const command = `npm pkg get "${dependencyType}" --prefix ${contextDir}`
cp.exec(
    command,
    /*
    should return something like this:

    {
        "@types/node": "^22.4.0",
        "typescript": "^5.5.4"
    }

    */
    (err, stdout, stderr) => {
        if (err !== null) {
            console.error(`${stderr}`)
            process.exit(1)
        } else {
            try {
                JSON.parse(stdout)
            } catch (e) {
                console.error(`error while executing ${argv[1]}`)
                console.error(`working directory: ${cwd()}`)
                console.error(`the command that was run: \`${command}\``)
                console.error(`the output of the command is not valid JSON: '${stdout}'`)
                process.exit(1)
            }
            /* we have a valid JSON */
            const dependencies = Object.keys(JSON.parse(stdout))
            if (dependencies.length === 0) {
                if (beVerbose) {
                    console.log("-no dependencies-")
                }
            } else {
                const versions: [string, string][] = []

                function push(key: string, version: string) {
                    versions.push([key, version])
                    /*
                    every version check is an asynchronous process, so with every result we need to check
                    if all versions are processed, if so, do the final step
                     */
                    if (versions.length === dependencies.length) {
                        cp.exec(`npm pkg set ${versions.map(($) => `${dependencyType}.${$[0]}="^${$[1]}"`).join(" ")} --prefix ${contextDir}`, (err, stdout, stderr) => {
                            /*
                            updates the version numbers in the package.json file
                            */
                            if (beVerbose) {
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
                    cp.exec(`npm view ${key}@latest version`, (err, stdout, stderr) => {
                        /*
                        gets the latest version from the online database
                        */
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