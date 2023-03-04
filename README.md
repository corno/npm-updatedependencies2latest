this is a lightweight tool to update the dependencies in a package.json
It does not have any dependencies and is 60 lines of code
It uses the following NPM commands:
-npm pkg get
-npm view
-npm pkg set

install:
npm install -g npm-updatedependencies2latest

run:
update2latest dirContainingPackage.json dependencies|devDependencies [verbose]

