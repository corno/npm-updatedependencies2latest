import * as cp from "child_process"

if (process.argv.length !== 3) {
    throw new Error("expected path to dir containing package.json")
}

cp.exec(
    `npm pkg get "dependencies" --prefix ${process.argv[2]}`,
    (err, stdout, stderr) => {
        if (err !== null) {
            console.error(`${stderr}`)
            process.exit(1)
        } else {
            Object.keys(JSON.parse(stdout)).forEach((key) => {
                cp.exec(
                    `npm view ${key}@latest version`,
                    (err, stdout, stderr) => {
                        if (err !== null) {
                            console.error(`${stderr}`)
                            process.exit(1)
                        } else {
                            cp.exec(
                                `npm pkg set "dependencies.${key}"="^${stdout.trimEnd()}"`,
                                (err, stdout, stderr) => {
                                    if (err !== null) {
                                        console.error(`${stderr}`)
                                        process.exit(1)
                                    } else {
                                        //nothing to do
                                    }
                                }
                            )
                        }
                    }
                )
            })
        }
    }
)